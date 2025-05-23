import { 
  users, runners, jobs, services, subscriptions, disputes, analytics,
  type User, type InsertUser,
  type Runner, type InsertRunner,
  type Job, type InsertJob,
  type Service, type InsertService,
  type Subscription, type InsertSubscription,
  type Dispute, type InsertDispute,
  type Analytics, type InsertAnalytics
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Runner methods
  getRunners(): Promise<Runner[]>;
  getRunner(id: number): Promise<Runner | undefined>;
  getRunnerByUserId(userId: number): Promise<Runner | undefined>;
  createRunner(runner: InsertRunner): Promise<Runner>;
  updateRunner(id: number, runner: Partial<Runner>): Promise<Runner | undefined>;
  getPendingRunners(): Promise<Runner[]>;
  
  // Job methods
  getJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;
  getJobsByStatus(status: string): Promise<Job[]>;
  getRecentJobs(limit?: number): Promise<Job[]>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Subscription methods
  getSubscriptions(): Promise<Subscription[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription | undefined>;
  
  // Dispute methods
  getDisputes(): Promise<Dispute[]>;
  getDispute(id: number): Promise<Dispute | undefined>;
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  updateDispute(id: number, dispute: Partial<Dispute>): Promise<Dispute | undefined>;
  getOpenDisputes(): Promise<Dispute[]>;
  
  // Analytics methods
  getAnalytics(): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getLatestAnalytics(): Promise<Analytics | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private runners: Map<number, Runner>;
  private jobs: Map<number, Job>;
  private services: Map<number, Service>;
  private subscriptions: Map<number, Subscription>;
  private disputes: Map<number, Dispute>;
  private analyticsData: Map<number, Analytics>;
  private currentUserId: number;
  private currentRunnerId: number;
  private currentJobId: number;
  private currentServiceId: number;
  private currentSubscriptionId: number;
  private currentDisputeId: number;
  private currentAnalyticsId: number;

  constructor() {
    this.users = new Map();
    this.runners = new Map();
    this.jobs = new Map();
    this.services = new Map();
    this.subscriptions = new Map();
    this.disputes = new Map();
    this.analyticsData = new Map();
    this.currentUserId = 1;
    this.currentRunnerId = 1;
    this.currentJobId = 1;
    this.currentServiceId = 1;
    this.currentSubscriptionId = 1;
    this.currentDisputeId = 1;
    this.currentAnalyticsId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentUserId++,
      email: "admin@guhdeh.com",
      password: "admin123", // In real app, this would be hashed
      role: "admin",
      fullName: "Admin User",
      isVerified: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Seed some initial analytics data
    const analyticsData: Analytics = {
      id: this.currentAnalyticsId++,
      date: new Date(),
      totalJobs: 1247,
      completedJobs: 1098,
      activeRunners: 89,
      revenue: "34521.00",
      disputes: 12,
    };
    this.analyticsData.set(analyticsData.id, analyticsData);

    // Seed some services
    const services = [
      { name: "Grocery Shopping", category: "grocery", basePrice: "15.00", pricePerKm: "2.50" },
      { name: "Food Delivery", category: "food", basePrice: "12.00", pricePerKm: "2.00" },
      { name: "Pharmacy Pickup", category: "pharmacy", basePrice: "10.00", pricePerKm: "1.50" },
      { name: "Document Delivery", category: "documents", basePrice: "8.00", pricePerKm: "1.00" },
    ];

    services.forEach(service => {
      const newService: Service = {
        id: this.currentServiceId++,
        name: service.name,
        description: `Professional ${service.name.toLowerCase()} service`,
        category: service.category,
        basePrice: service.basePrice,
        pricePerKm: service.pricePerKm,
        isActive: true,
        createdAt: new Date(),
      };
      this.services.set(newService.id, newService);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Runner methods
  async getRunners(): Promise<Runner[]> {
    return Array.from(this.runners.values());
  }

  async getRunner(id: number): Promise<Runner | undefined> {
    return this.runners.get(id);
  }

  async getRunnerByUserId(userId: number): Promise<Runner | undefined> {
    return Array.from(this.runners.values()).find(runner => runner.userId === userId);
  }

  async createRunner(insertRunner: InsertRunner): Promise<Runner> {
    const runner: Runner = {
      ...insertRunner,
      id: this.currentRunnerId++,
      createdAt: new Date(),
    };
    this.runners.set(runner.id, runner);
    return runner;
  }

  async updateRunner(id: number, updates: Partial<Runner>): Promise<Runner | undefined> {
    const runner = this.runners.get(id);
    if (!runner) return undefined;
    
    const updatedRunner = { ...runner, ...updates };
    this.runners.set(id, updatedRunner);
    return updatedRunner;
  }

  async getPendingRunners(): Promise<Runner[]> {
    return Array.from(this.runners.values()).filter(runner => runner.verificationStatus === "pending");
  }

  // Job methods
  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const job: Job = {
      ...insertJob,
      id: this.currentJobId++,
      createdAt: new Date(),
      completedAt: null,
    };
    this.jobs.set(job.id, job);
    return job;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    if (updates.status === "completed" && !updatedJob.completedAt) {
      updatedJob.completedAt = new Date();
    }
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async getJobsByStatus(status: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  async getRecentJobs(limit: number = 10): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const service: Service = {
      ...insertService,
      id: this.currentServiceId++,
      createdAt: new Date(),
    };
    this.services.set(service.id, service);
    return service;
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updates };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(sub => sub.userId === userId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const subscription: Subscription = {
      ...insertSubscription,
      id: this.currentSubscriptionId++,
      startDate: new Date(),
    };
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription = { ...subscription, ...updates };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Dispute methods
  async getDisputes(): Promise<Dispute[]> {
    return Array.from(this.disputes.values());
  }

  async getDispute(id: number): Promise<Dispute | undefined> {
    return this.disputes.get(id);
  }

  async createDispute(insertDispute: InsertDispute): Promise<Dispute> {
    const dispute: Dispute = {
      ...insertDispute,
      id: this.currentDisputeId++,
      createdAt: new Date(),
      resolvedAt: null,
    };
    this.disputes.set(dispute.id, dispute);
    return dispute;
  }

  async updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined> {
    const dispute = this.disputes.get(id);
    if (!dispute) return undefined;
    
    const updatedDispute = { ...dispute, ...updates };
    if (updates.status === "resolved" && !updatedDispute.resolvedAt) {
      updatedDispute.resolvedAt = new Date();
    }
    this.disputes.set(id, updatedDispute);
    return updatedDispute;
  }

  async getOpenDisputes(): Promise<Dispute[]> {
    return Array.from(this.disputes.values()).filter(dispute => dispute.status === "open");
  }

  // Analytics methods
  async getAnalytics(): Promise<Analytics[]> {
    return Array.from(this.analyticsData.values());
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const analytics: Analytics = {
      ...insertAnalytics,
      id: this.currentAnalyticsId++,
      date: new Date(),
    };
    this.analyticsData.set(analytics.id, analytics);
    return analytics;
  }

  async getLatestAnalytics(): Promise<Analytics | undefined> {
    const analytics = Array.from(this.analyticsData.values());
    return analytics.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())[0];
  }
}

// Use memory storage for now to keep your dashboard running
export const storage = new MemStorage();
