export interface HealthStatus {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
}

export class HealthService {
  private startTime = Date.now();

  getHealth(): HealthStatus {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      environment: process.env.NODE_ENV || "development",
      version: "0.1.0",
    };
  }
}

export const healthService = new HealthService();
