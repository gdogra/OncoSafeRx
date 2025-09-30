
// Analytics API endpoints
app.post('/api/analytics', (req, res) => {
  console.log('📊 Analytics event received:', req.body?.eventType);
  res.status(200).json({ success: true });
});

app.get('/api/analytics/metrics', (req, res) => {
  console.log('📊 Analytics metrics requested:', req.query?.range);
  res.status(200).json({
    totalVisitors: 42,
    totalPageviews: 156,
    totalSessions: 28,
    totalInteractions: 89,
    avgSessionDuration: 245000,
    topPages: [
      { path: '/dashboard', views: 45 },
      { path: '/search', views: 32 },
      { path: '/patients', views: 28 }
    ]
  });
});

