import { Request, Response } from 'express';
import { explainCodeService } from '../services/explain.service';

export const handleExplain = (req: Request, res: Response) => {
  const { code, language } = req.body;

  if (!code || typeof code !== 'string' || code.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Code is required"
    });
  }

  const result = explainCodeService(code, language || 'Unknown');
  
  res.json({
    success: true,
    mode: result.mode,
    explanation: result.explanation,
    patterns: result.patterns
  });
};
