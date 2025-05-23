import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
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
import { eq, desc, and, sql } from "drizzle-orm";
import type { IStorage } from "./storage";

// Initialize database connection
const connection = neon(process.env.DATABASE_URL!);
export const db = drizzle(connection);

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Runner methods
  async getRunners(): Promise<Runner[]> {
    return await db.select().from(runners).orderBy(desc(runners.createdAt));
  }

  async getRunner(id: number): Promise<Runner | undefined> {
    const result = await db.select().from(runners).where(eq(runners.id, id)).limit(1);
    return result[0];
  }

  async getRunnerByUserId(userId: number): Promise<Runner | undefined> {
    const result = await db.select().from(runners).where(eq(runners.userId, userId)).limit(1);
    return result[0];
  }

  async createRunner(runner: InsertRunner): Promise<Runner> {
    const result = await db.insert(runners).values(runner).returning();
    return result[0];
  }

  async updateRunner(id: number, updates: Partial<Runner>): Promise<Runner | undefined> {
    const result = await db.update(runners).set(updates).where(eq(runners.id, id)).returning();
    return result[0];
  }

  async getPendingRunners(): Promise<Runner[]> {
    return await db.select().from(runners)
      .where(eq(runners.verificationStatus, "pending"))
      .orderBy(desc(runners.createdAt));
  }

  // Job methods
  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return result[0];
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const result = await db.update(jobs).set(updates).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  async getJobsByStatus(status: string): Promise<Job[]> {
    return await db.select().from(jobs)
      .where(eq(jobs.status, status as Job["status"]))
      .orderBy(desc(jobs.createdAt));
  }

  async getRecentJobs(limit: number = 10): Promise<Job[]> {
    return await db.select().from(jobs)
      .orderBy(desc(jobs.createdAt))
      .limit(limit);
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(services.name);
  }

  async getService(id: number): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return result[0];
  }

  async createService(service: InsertService): Promise<Service> {
    const result = await db.insert(services).values(service).returning();
    return result[0];
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service | undefined> {
    const result = await db.update(services).set(updates).where(eq(services.id, id)).returning();
    return result[0];
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
    return result[0];
  }

  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
      .limit(1);
    return result[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(subscription).returning();
    return result[0];
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const result = await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }

  // Dispute methods
  async getDisputes(): Promise<Dispute[]> {
    return await db.select().from(disputes).orderBy(desc(disputes.createdAt));
  }

  async getDispute(id: number): Promise<Dispute | undefined> {
    const result = await db.select().from(disputes).where(eq(disputes.id, id)).limit(1);
    return result[0];
  }

  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const result = await db.insert(disputes).values(dispute).returning();
    return result[0];
  }

  async updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined> {
    const result = await db.update(disputes).set(updates).where(eq(disputes.id, id)).returning();
    return result[0];
  }

  async getOpenDisputes(): Promise<Dispute[]> {
    return await db.select().from(disputes)
      .where(eq(disputes.status, "open"))
      .orderBy(desc(disputes.createdAt));
  }

  // Analytics methods
  async getAnalytics(): Promise<Analytics[]> {
    return await db.select().from(analytics).orderBy(desc(analytics.date));
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const result = await db.insert(analytics).values(analyticsData).returning();
    return result[0];
  }

  async getLatestAnalytics(): Promise<Analytics | undefined> {
    const result = await db.select().from(analytics)
      .orderBy(desc(analytics.date))
      .limit(1);
    return result[0];
  }
}