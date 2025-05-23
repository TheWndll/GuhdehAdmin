import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRunnerSchema, insertJobSchema, insertServiceSchema, insertSubscriptionSchema, insertDisputeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // In a real app, you'd set up proper session management
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getLatestAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/revenue", async (req, res) => {
    try {
      // Generate sample revenue data for the last 6 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const data = months.map((month, index) => ({
        month,
        revenue: Math.floor(Math.random() * 20000) + 10000 + (index * 2000)
      }));
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  app.get("/api/analytics/job-status", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      const statusCounts = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const data = [
        { status: "Completed", count: statusCounts.completed || 65 },
        { status: "In Progress", count: statusCounts.in_progress || 20 },
        { status: "Pending", count: statusCounts.pending || 10 },
        { status: "Cancelled", count: statusCounts.cancelled || 5 },
      ];
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job status data" });
    }
  });

  // Runner routes
  app.get("/api/runners", async (req, res) => {
    try {
      const runners = await storage.getRunners();
      res.json(runners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch runners" });
    }
  });

  app.get("/api/runners/pending", async (req, res) => {
    try {
      const pendingRunners = await storage.getPendingRunners();
      res.json(pendingRunners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending runners" });
    }
  });

  app.put("/api/runners/:id/verify", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedRunner = await storage.updateRunner(id, { 
        verificationStatus: status,
        backgroundCheckPassed: status === "approved",
      });
      
      if (!updatedRunner) {
        return res.status(404).json({ message: "Runner not found" });
      }
      
      res.json(updatedRunner);
    } catch (error) {
      res.status(500).json({ message: "Failed to update runner verification" });
    }
  });

  app.post("/api/runners", async (req, res) => {
    try {
      const result = insertRunnerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid runner data", errors: result.error });
      }
      
      const runner = await storage.createRunner(result.data);
      res.status(201).json(runner);
    } catch (error) {
      res.status(500).json({ message: "Failed to create runner" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentJobs = await storage.getRecentJobs(limit);
      res.json(recentJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const result = insertJobSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid job data", errors: result.error });
      }
      
      const job = await storage.createJob(result.data);
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedJob = await storage.updateJob(id, req.body);
      
      if (!updatedJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const result = insertServiceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid service data", errors: result.error });
      }
      
      const service = await storage.createService(result.data);
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedService = await storage.updateService(id, req.body);
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteService(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Subscription routes
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const result = insertSubscriptionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid subscription data", errors: result.error });
      }
      
      const subscription = await storage.createSubscription(result.data);
      res.status(201).json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.put("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedSubscription = await storage.updateSubscription(id, req.body);
      
      if (!updatedSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.json(updatedSubscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Dispute routes
  app.get("/api/disputes", async (req, res) => {
    try {
      const disputes = await storage.getDisputes();
      res.json(disputes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  app.get("/api/disputes/open", async (req, res) => {
    try {
      const openDisputes = await storage.getOpenDisputes();
      res.json(openDisputes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch open disputes" });
    }
  });

  app.post("/api/disputes", async (req, res) => {
    try {
      const result = insertDisputeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid dispute data", errors: result.error });
      }
      
      const dispute = await storage.createDispute(result.data);
      res.status(201).json(dispute);
    } catch (error) {
      res.status(500).json({ message: "Failed to create dispute" });
    }
  });

  app.put("/api/disputes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedDispute = await storage.updateDispute(id, req.body);
      
      if (!updatedDispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      res.json(updatedDispute);
    } catch (error) {
      res.status(500).json({ message: "Failed to update dispute" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
