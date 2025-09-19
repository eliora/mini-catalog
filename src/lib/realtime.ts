import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { RealtimeEvent, SubscriptionConfig } from '@/types/api';

// Real-time subscription management utilities
export class RealtimeManager {
  private client: SupabaseClient<Database>;
  private subscriptions: Map<string, RealtimeChannel> = new Map();

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  /**
   * Subscribe to real-time changes on a table
   */
  subscribe<T = unknown>(
    config: SubscriptionConfig,
    callback: (event: RealtimeEvent<T>) => void
  ): string {
    const subscriptionId = this.generateSubscriptionId(config);
    
    // Clean up existing subscription with same ID
    this.unsubscribe(subscriptionId);

    const channel = this.client
      .channel(`realtime:${subscriptionId}`)
      .on(
        'postgres_changes' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter,
        } as Record<string, unknown>,
        (payload: Record<string, unknown>) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            schema: String(payload.schema),
            table: String(payload.table),
            new: payload.new as T,
            old: payload.old as T,
            errors: payload.errors as unknown[] | undefined,
          });
        }
      )
      .subscribe();

    this.subscriptions.set(subscriptionId, channel);
    return subscriptionId;
  }

  /**
   * Unsubscribe from a specific subscription
   */
  unsubscribe(subscriptionId: string): void {
    const channel = this.subscriptions.get(subscriptionId);
    if (channel) {
      this.client.removeChannel(channel);
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((channel) => {
      this.client.removeChannel(channel);
    });
    this.subscriptions.clear();
  }

  /**
   * Get active subscription count
   */
  getActiveSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Check if a subscription is active
   */
  isSubscribed(subscriptionId: string): boolean {
    return this.subscriptions.has(subscriptionId);
  }

  private generateSubscriptionId(config: SubscriptionConfig): string {
    return `${config.table}-${config.event || 'all'}-${config.filter || 'none'}`;
  }
}

// Specific real-time subscription helpers
export const createCartSubscription = (
  client: SupabaseClient<Database>,
  userId: string,
  onCartUpdate: (event: RealtimeEvent) => void
) => {
  const manager = new RealtimeManager(client);
  return manager.subscribe(
    {
      table: 'cart_items',
      event: '*',
      filter: `user_id=eq.${userId}`,
    },
    onCartUpdate
  );
};

export const createProductSubscription = (
  client: SupabaseClient<Database>,
  onProductUpdate: (event: RealtimeEvent) => void
) => {
  const manager = new RealtimeManager(client);
  return manager.subscribe(
    {
      table: 'products',
      event: '*',
    },
    onProductUpdate
  );
};

export const createOrderSubscription = (
  client: SupabaseClient<Database>,
  userId: string,
  onOrderUpdate: (event: RealtimeEvent) => void
) => {
  const manager = new RealtimeManager(client);
  return manager.subscribe(
    {
      table: 'orders',
      event: '*',
      filter: `user_id=eq.${userId}`,
    },
    onOrderUpdate
  );
};

export const createCompanySettingsSubscription = (
  client: SupabaseClient<Database>,
  onSettingsUpdate: (event: RealtimeEvent) => void
) => {
  const manager = new RealtimeManager(client);
  return manager.subscribe(
    {
      table: 'settings',
      event: 'UPDATE',
    },
    onSettingsUpdate
  );
};

// Utility function to create a global realtime manager
let globalRealtimeManager: RealtimeManager | null = null;

export const getGlobalRealtimeManager = (client: SupabaseClient<Database>): RealtimeManager => {
  if (!globalRealtimeManager) {
    globalRealtimeManager = new RealtimeManager(client);
  }
  return globalRealtimeManager;
};

export const cleanupGlobalRealtimeManager = () => {
  if (globalRealtimeManager) {
    globalRealtimeManager.unsubscribeAll();
    globalRealtimeManager = null;
  }
};

export default RealtimeManager;
