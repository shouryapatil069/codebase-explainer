import { Request, Response } from 'express';

export const checkHealth = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Codebase Explainer API is running"
  });
};
