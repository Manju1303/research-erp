// ============================================================
// Automation Module
// Central hub for all event-driven automation in the ERP.
// Registers: EventEmitter, Scheduled Jobs, Event Listeners
// ============================================================

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationDispatcher } from './listeners/notification-dispatcher.listener';
import { StatusCascadeListener } from './listeners/status-cascade.listener';
import { AutoTaskCreationListener } from './listeners/auto-task-creation.listener';
import { AutomationScheduler } from './scheduler/automation.scheduler';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Wildcards allow listening to groups of events like project.*
      wildcard: false,
      // Increase max listeners for complex cascades
      maxListeners: 20,
      // Verbose error handling in development
      verboseMemoryLeak: true,
    }),
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  providers: [
    // Event Listeners
    NotificationDispatcher,
    StatusCascadeListener,
    AutoTaskCreationListener,

    // Scheduled Jobs
    AutomationScheduler,
  ],
  exports: [],
})
export class AutomationModule {}
