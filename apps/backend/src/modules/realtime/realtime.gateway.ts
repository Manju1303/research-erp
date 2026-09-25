import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DomainEvents,
  ProjectCreatedEvent,
  ProjectStatusChangedEvent,
  ManuscriptStatusChangedEvent,
  SubmissionCreatedEvent,
  SubmissionStatusChangedEvent,
  TaskCreatedEvent,
  TaskStatusChangedEvent,
  PublicationCreatedEvent,
} from '../automation/events/domain-events';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        (socket.handshake.query?.token as string);

      if (!token) {
        this.logger.warn(`Unauthorized WebSocket connection rejected: ${socket.id}`);
        socket.disconnect();
        return;
      }

      const secret = this.config.get<string>('jwt.accessSecret') || 'secret';
      const payload = await this.jwtService.verifyAsync(token, { secret });

      socket.data.user = payload;
      // Join private user room
      socket.join(`user:${payload.sub}`);
      // Join global authenticated broadcast room
      socket.join('authenticated');

      this.logger.log(`WebSocket client authenticated: ${socket.id} (user: ${payload.sub})`);
    } catch (err) {
      this.logger.warn(`WebSocket authentication failed for ${socket.id}: ${err.message}`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`WebSocket client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('project:subscribe')
  handleSubscribeProject(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    if (data?.projectId) {
      socket.join(`project:${data.projectId}`);
      this.logger.debug(`Socket ${socket.id} subscribed to project:${data.projectId}`);
      return { status: 'subscribed', projectId: data.projectId };
    }
  }

  @SubscribeMessage('project:unsubscribe')
  handleUnsubscribeProject(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    if (data?.projectId) {
      socket.leave(`project:${data.projectId}`);
      return { status: 'unsubscribed', projectId: data.projectId };
    }
  }

  // ─────────────────────────────────────────────
  // DOMAIN EVENT LISTENERS → REAL-TIME BROADCASTS
  // ─────────────────────────────────────────────

  @OnEvent('project.created')
  handleProjectCreated(event: ProjectCreatedEvent) {
    this.server?.to('authenticated').emit('project:created', event);
  }

  @OnEvent('project.status_changed')
  handleProjectStatusChanged(event: ProjectStatusChangedEvent) {
    this.server?.to(`project:${event.projectId}`).emit('project:status_changed', event);
    this.server?.to('authenticated').emit('project:status_changed', event);
  }

  @OnEvent(DomainEvents.MANUSCRIPT_STATUS_CHANGED)
  handleManuscriptStatusChanged(event: ManuscriptStatusChangedEvent) {
    this.server?.to(`project:${event.projectId}`).emit('manuscript:status_changed', event);
  }

  @OnEvent(DomainEvents.SUBMISSION_CREATED)
  handleSubmissionCreated(event: SubmissionCreatedEvent) {
    this.server?.to(`project:${event.projectId}`).emit('submission:created', event);
  }

  @OnEvent(DomainEvents.SUBMISSION_STATUS_CHANGED)
  handleSubmissionStatusChanged(event: SubmissionStatusChangedEvent) {
    this.server?.to(`project:${event.projectId}`).emit('submission:status_changed', event);
  }

  @OnEvent(DomainEvents.TASK_CREATED)
  handleTaskCreated(event: TaskCreatedEvent) {
    if (event.assigneeId) {
      this.server?.to(`user:${event.assigneeId}`).emit('task:assigned', event);
    }
    if (event.projectId) {
      this.server?.to(`project:${event.projectId}`).emit('task:created', event);
    }
  }

  @OnEvent(DomainEvents.TASK_STATUS_CHANGED)
  handleTaskStatusChanged(event: TaskStatusChangedEvent) {
    if (event.projectId) {
      this.server?.to(`project:${event.projectId}`).emit('task:status_changed', event);
    }
  }

  @OnEvent(DomainEvents.PUBLICATION_CREATED)
  handlePublicationCreated(event: PublicationCreatedEvent) {
    this.server?.to(`project:${event.projectId}`).emit('publication:created', event);
    this.server?.to('authenticated').emit('publication:created', event);
  }
}
