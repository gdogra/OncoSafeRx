import express from 'express';
import PDFDocument from 'pdfkit';
import REGIMENS from '../data/regimens.js';

const router = express.Router();

router.get('/regimen/:id/pdf', (req, res) => {
  const reg = REGIMENS.find(r => r.id.toLowerCase() === String(req.params.id).toLowerCase());
  if (!reg) return res.status(404).json({ error: 'Regimen not found' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="regimen-${reg.id}.pdf"`);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);
  doc.fontSize(18).text(`Regimen: ${reg.name}`, { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Indication: ${reg.indication}`);
  if (reg.cycleLengthDays) doc.text(`Cycle length: ${reg.cycleLengthDays} days`);
  doc.moveDown().fontSize(14).text('Components');
  (reg.components || []).forEach(c => doc.fontSize(12).text(`• ${c.name}: ${c.dose}`));
  if (reg.pretreatment?.length) {
    doc.moveDown().fontSize(14).text('Pre-treatment');
    reg.pretreatment.forEach(p => doc.fontSize(12).text(`• ${p}`));
  }
  if (reg.monitoring?.length) {
    doc.moveDown().fontSize(14).text('Monitoring');
    reg.monitoring.forEach(m => doc.fontSize(12).text(`• ${m}`));
  }
  if (reg.adjustments?.length) {
    doc.moveDown().fontSize(14).text('Dose Adjustments');
    reg.adjustments.forEach(a => doc.fontSize(12).text(`• ${a.criterion}: ${a.action}`));
  }
  if (reg.notes?.length) {
    doc.moveDown().fontSize(14).text('Notes');
    reg.notes.forEach(n => doc.fontSize(12).text(`• ${n}`));
  }
  doc.end();
});

export default router;

