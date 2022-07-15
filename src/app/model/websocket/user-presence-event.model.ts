export class UserPresenceEvent {
  constructor(public uid: string, public lastSeenAt: Date) {}
}
