import express from 'express';
import supabaseService from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const { supabase } = supabaseService;

// Authentication middleware for all care plan routes
router.use(authenticateToken);

/**
 * GET /api/careplan/patient
 * Get care plan data for the current patient
 */
router.get('/patient', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get care plan sections
    const { data: sections, error: sectionsError } = await supabase
      .from('care_plan_sections')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching care plan sections:', sectionsError);
      return res.status(500).json({ error: 'Failed to fetch care plan sections' });
    }

    // Get care plan goals
    const { data: goals, error: goalsError } = await supabase
      .from('care_plan_goals')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: true });

    if (goalsError) {
      console.error('Error fetching care plan goals:', goalsError);
      return res.status(500).json({ error: 'Failed to fetch care plan goals' });
    }

    // Get next appointment
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', userId)
      .eq('status', 'scheduled')
      .gte('appointment_date', new Date().toISOString())
      .order('appointment_date', { ascending: true })
      .limit(1);

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
    }

    // Get care plan metadata
    const { data: carePlan, error: carePlanError } = await supabase
      .from('care_plans')
      .select('*')
      .eq('patient_id', userId)
      .single();

    if (carePlanError && carePlanError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching care plan:', carePlanError);
    }

    const response = {
      sections: sections || [],
      goals: goals || [],
      nextAppointment: appointments?.[0]?.appointment_date || null,
      lastUpdated: carePlan?.updated_at || new Date().toISOString(),
      reviewDate: carePlan?.review_date || null,
      doctorName: carePlan?.primary_physician || 'Your Care Team'
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /patient endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/careplan/team
 * Get care team members for the current patient
 */
router.get('/team', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: teamMembers, error } = await supabase
      .from('care_team_members')
      .select(`
        *,
        users (
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('patient_id', userId)
      .eq('is_active', true)
      .order('role', { ascending: true });

    if (error) {
      console.error('Error fetching care team:', error);
      return res.status(500).json({ error: 'Failed to fetch care team' });
    }

    const formattedTeamMembers = teamMembers.map(member => ({
      id: member.id,
      name: `${member.users?.first_name || ''} ${member.users?.last_name || ''}`.trim() || member.name,
      role: member.role,
      specialty: member.specialty,
      hospital: member.hospital || 'Healthcare Facility',
      department: member.department || 'Oncology',
      email: member.users?.email || member.email,
      phone: member.phone,
      availability: member.availability || 'available',
      lastActive: member.last_active || new Date().toISOString(),
      avatar: member.users?.avatar_url || null,
      certifications: member.certifications || [],
      yearsExperience: member.years_experience || 0
    }));

    res.json(formattedTeamMembers);
  } catch (error) {
    console.error('Error in /team endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/careplan/tasks
 * Get care tasks for the current patient
 */
router.get('/tasks', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: tasks, error } = await supabase
      .from('care_tasks')
      .select(`
        *,
        assigned_to_user:users!care_tasks_assigned_to_fkey (
          first_name,
          last_name
        ),
        assigned_by_user:users!care_tasks_assigned_by_fkey (
          first_name,
          last_name
        )
      `)
      .eq('patient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching care tasks:', error);
      return res.status(500).json({ error: 'Failed to fetch care tasks' });
    }

    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      status: task.status,
      assignedTo: `${task.assigned_to_user?.first_name || ''} ${task.assigned_to_user?.last_name || ''}`.trim() || task.assigned_to,
      assignedBy: `${task.assigned_by_user?.first_name || ''} ${task.assigned_by_user?.last_name || ''}`.trim() || task.assigned_by,
      dueDate: task.due_date,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      notes: task.notes,
      dependencies: task.dependencies || [],
      patientId: task.patient_id
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error in /tasks endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/careplan/plans
 * Get care plans for coordination hub
 */
router.get('/plans', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('care_plans')
      .select(`
        *,
        patient:users!care_plans_patient_id_fkey (
          first_name,
          last_name,
          email
        ),
        primary_physician_user:users!care_plans_primary_physician_id_fkey (
          first_name,
          last_name
        )
      `);

    // If user is patient, only show their own care plan
    if (userRole === 'patient' || userRole === 'caregiver') {
      query = query.eq('patient_id', userId);
    }

    const { data: carePlans, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching care plans:', error);
      return res.status(500).json({ error: 'Failed to fetch care plans' });
    }

    const formattedPlans = carePlans.map(plan => ({
      id: plan.id,
      patientId: plan.patient_id,
      patientName: `${plan.patient?.first_name || ''} ${plan.patient?.last_name || ''}`.trim(),
      diagnosis: plan.diagnosis,
      stage: plan.stage,
      treatmentPhase: plan.treatment_phase,
      primaryOncologist: `${plan.primary_physician_user?.first_name || ''} ${plan.primary_physician_user?.last_name || ''}`.trim() || plan.primary_physician,
      startDate: plan.start_date,
      nextReviewDate: plan.review_date,
      goals: plan.goals || [],
      milestones: plan.milestones || [],
      riskFactors: plan.risk_factors || [],
      allergies: plan.allergies || [],
      currentMedications: plan.current_medications || []
    }));

    res.json(formattedPlans);
  } catch (error) {
    console.error('Error in /plans endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/careplan/communications
 * Get communication threads for the current patient
 */
router.get('/communications', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: communications, error } = await supabase
      .from('communication_threads')
      .select(`
        *,
        last_message:messages (
          content,
          created_at,
          sender_id,
          read_by
        )
      `)
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching communications:', error);
      return res.status(500).json({ error: 'Failed to fetch communications' });
    }

    const formattedCommunications = communications.map(thread => ({
      id: thread.id,
      subject: thread.subject,
      participants: thread.participants,
      patientId: thread.patient_id,
      type: thread.type,
      lastMessage: {
        sender: thread.last_message?.sender_id || 'System',
        content: thread.last_message?.content || '',
        timestamp: thread.last_message?.created_at || thread.updated_at,
        read: thread.last_message?.read_by?.includes(userId) || false
      },
      unreadCount: thread.unread_count || 0,
      priority: thread.priority || 'normal'
    }));

    res.json(formattedCommunications);
  } catch (error) {
    console.error('Error in /communications endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/careplan/goals/:goalId
 * Update care plan goal progress
 */
router.patch('/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be a number between 0 and 100' });
    }

    const { data, error } = await supabase
      .from('care_plan_goals')
      .update({ 
        progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .eq('patient_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      return res.status(500).json({ error: 'Failed to update goal' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal updated successfully', goal: data });
  } catch (error) {
    console.error('Error in /goals/:goalId endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/careplan/tasks
 * Create a new care task
 */
router.post('/tasks', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      type,
      priority,
      assignedTo,
      dueDate,
      notes,
      dependencies
    } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ error: 'Title, description, and type are required' });
    }

    const { data, error } = await supabase
      .from('care_tasks')
      .insert({
        title,
        description,
        type,
        priority: priority || 'medium',
        status: 'pending',
        assigned_to: assignedTo || userId,
        assigned_by: userId,
        due_date: dueDate,
        created_at: new Date().toISOString(),
        notes,
        dependencies: dependencies || [],
        patient_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in POST /tasks endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/careplan/tasks/:taskId
 * Update task status
 */
router.patch('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('care_tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('patient_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task updated successfully', task: data });
  } catch (error) {
    console.error('Error in PATCH /tasks/:taskId endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/careplan/messages
 * Send a message to care team
 */
router.post('/messages', async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, content, recipients, type } = req.body;

    if (!subject || !content || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: 'Subject, content, and recipients array are required' });
    }

    // Create or find existing thread
    const threadData = {
      subject,
      participants: [userId, ...recipients],
      patient_id: userId,
      type: type || 'general',
      priority: 'normal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: thread, error: threadError } = await supabase
      .from('communication_threads')
      .insert(threadData)
      .select()
      .single();

    if (threadError) {
      console.error('Error creating thread:', threadError);
      return res.status(500).json({ error: 'Failed to create thread' });
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        thread_id: thread.id,
        sender_id: userId,
        content,
        created_at: new Date().toISOString(),
        read_by: [userId]
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    res.status(201).json({ message: 'Message sent successfully', thread, message });
  } catch (error) {
    console.error('Error in POST /messages endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/careplan/request-update
 * Request care plan update from provider
 */
router.post('/request-update', async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create an update request task
    const { data, error } = await supabase
      .from('care_tasks')
      .insert({
        title: 'Care Plan Update Request',
        description: message,
        type: 'follow_up',
        priority: 'medium',
        status: 'pending',
        assigned_to: 'care-team', // Will be assigned to care team
        assigned_by: userId,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        created_at: new Date().toISOString(),
        patient_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating update request:', error);
      return res.status(500).json({ error: 'Failed to create update request' });
    }

    res.json({ message: 'Update request submitted successfully', request: data });
  } catch (error) {
    console.error('Error in /request-update endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/careplan/pdf
 * Generate care plan PDF
 */
router.get('/pdf', async (req, res) => {
  try {
    const userId = req.user.id;

    // For now, return a simple response indicating PDF generation is not implemented
    // In a real implementation, you would use a PDF generation library like puppeteer or jsPDF
    res.setHeader('Content-Type', 'application/json');
    res.json({ 
      error: 'PDF generation not implemented yet',
      message: 'This feature will be available soon. For now, you can print the care plan page.',
      downloadUrl: null
    });
    
    // TODO: Implement actual PDF generation
    /*
    const pdf = await generateCarePlanPDF(userId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="care-plan.pdf"');
    res.send(pdf);
    */
  } catch (error) {
    console.error('Error in /pdf endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;