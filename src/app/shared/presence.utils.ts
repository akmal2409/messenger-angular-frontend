export class PresenceUtils {
  private static readonly FIVE_MIN_IN_MS = 1000 * 60 * 1;

  /**
   * if less than 5 minutes have passed since the user was active,
   * mark itas online
   * @param lastSeenAt
   * @returns
   */
  public static isOnline(lastSeenAt: Date | undefined) {
    if (lastSeenAt == null) return false;
    const now = new Date();
    return now.getTime() - lastSeenAt.getTime() < PresenceUtils.FIVE_MIN_IN_MS;
  }
}
