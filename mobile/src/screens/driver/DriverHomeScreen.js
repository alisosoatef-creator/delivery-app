import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BrandMark, InfoRow, MobileBadge, MobileButton, MobileCard, PressableScale, ScreenContainer, StatCard } from "../../components/ui";
import { updateDriverOnlineStatus } from "../../services/driverApi";
import { clearMobileSession, saveMobileSession } from "../../services/sessionStorage";
import { connectMobileSocket, disconnectMobileSocket, subscribeToDriverEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage } from "../../utils/errorUtils";
import { colors, depth, money, radii, shadows, spacing } from "../../utils/mobileTheme";

function driverSessionFromState(state, driver = {}) {
  return {
    ...state.session,
    token: state.token,
    role: "driver",
    driverId: state.currentUser?.driverId || state.session?.driverId || driver.id || "",
    phone: state.currentUser?.phone || state.session?.phone || driver.phone || "",
    userId: state.currentUser?.id || state.session?.id || ""
  };
}

export function DriverHomeScreen() {
  const { state, dispatch } = useMobileApp();
  const driver = state.session?.driver || {};
  const session = driverSessionFromState(state, driver);
  const [available, setAvailable] = useState((driver.onlineStatus || state.driverOnlineStatus || state.currentUser?.onlineStatus || "offline") === "online");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const availableCount = state.availableRides?.length || 0;
  const currentRide = state.currentRide;

  useEffect(() => {
    const nextOnlineStatus = driver.onlineStatus || state.driverOnlineStatus || state.currentUser?.onlineStatus || "offline";
    setAvailable(nextOnlineStatus === "online");
  }, [driver.onlineStatus, state.currentUser?.onlineStatus, state.driverOnlineStatus]);

  useEffect(() => {
    if (!session.driverId || !state.token) return undefined;
    connectMobileSocket(session);
    const unsubscribe = subscribeToDriverEvents((payload, eventName) => {
      if (eventName !== "driver:online-status-updated") return;
      const updatedDriver = payload?.driver;
      if (!updatedDriver?.id || String(updatedDriver.id) !== String(session.driverId)) return;
      applyDriverSession(updatedDriver, false);
    });
    return unsubscribe;
  }, [session.driverId, session.phone, state.token]);

  async function applyDriverSession(updatedDriver, persist = true) {
    const nextUser = {
      ...(state.currentUser || {}),
      driverId: updatedDriver.id,
      phone: updatedDriver.phone,
      fullName: updatedDriver.fullName || state.currentUser?.fullName,
      onlineStatus: updatedDriver.onlineStatus,
      online: updatedDriver.online
    };
    const nextSession = {
      ...(state.session || {}),
      token: state.token,
      driver: { ...(state.session?.driver || {}), ...updatedDriver },
      driverId: updatedDriver.id,
      phone: updatedDriver.phone
    };
    setAvailable(updatedDriver.onlineStatus === "online");
    dispatch({
      type: "patch",
      patch: {
        currentUser: nextUser,
        session: nextSession,
        driverOnlineStatus: updatedDriver.onlineStatus,
        connectionMessage: ""
      }
    });
    if (persist) {
      await saveMobileSession({
        token: state.token,
        role: "driver",
        currentUser: nextUser,
        session: nextSession,
        driverSession: updatedDriver,
        driverId: updatedDriver.id,
        phone: updatedDriver.phone,
        userId: nextUser.id
      });
    }
  }

  async function toggleAvailability() {
    if (!session.driverId) {
      setError("بيانات الكابتن غير مكتملة. سجل الدخول مرة أخرى.");
      return;
    }
    const previous = available;
    const nextAvailable = !previous;
    setAvailable(nextAvailable);
    setStatus("saving");
    setError("");
    try {
      const payload = await updateDriverOnlineStatus(nextAvailable, session);
      await applyDriverSession(payload.driver);
      dispatch({ type: "toast", message: nextAvailable ? "أصبحت متاحا لاستقبال الطلبات." : "أصبحت غير متاح للطلبات الجديدة." });
    } catch (requestError) {
      setAvailable(previous);
      const message = apiErrorMessage(requestError, "تعذر تحديث حالة توفر الكابتن.");
      setError(message);
      dispatch({ type: "patch", patch: { connectionMessage: message } });
    } finally {
      setStatus("idle");
    }
  }

  async function logout() {
    disconnectMobileSocket();
    await clearMobileSession();
    dispatch({ type: "logout", toast: "تم تسجيل خروج الكابتن." });
  }

  return (
    <ScreenContainer showHeader={false} variant="driver" compact>
      <MobileCard tone="command" style={styles.cockpit}>
        <View style={styles.cockpitTop}>
          <BrandMark compact title="وصل كابتن" />
          <MobileBadge label={available ? "متاح" : "غير متاح"} tone={available ? "success" : "warning"} />
        </View>
        <View style={styles.identity}>
          <Text selectable style={styles.role}>لوحة التشغيل</Text>
          <Text selectable style={styles.name}>{driver.fullName || state.currentUser?.fullName || "كابتن وصل"}</Text>
          <Text selectable style={styles.vehicle}>{driver.vehicleType || driver.vehicle || "مركبة"} · {driver.vehiclePlate || driver.plate || "بدون لوحة"}</Text>
        </View>
        <View style={styles.availabilityStrip}>
          <View style={styles.availabilityCopy}>
            <Text selectable style={styles.sectionTitle}>استقبال الطلبات</Text>
            <Text selectable style={styles.helper}>{available ? "القناة مفتوحة للطلبات المناسبة." : "الطلبات الجديدة متوقفة مؤقتا."}</Text>
          </View>
          <PressableScale
            accessibilityRole="switch"
            accessibilityLabel="تبديل حالة توفر الكابتن"
            disabled={status === "saving"}
            onPress={toggleAvailability}
            style={[styles.toggle, available && styles.toggleOn, status === "saving" && styles.toggleSaving]}
          >
            <View style={[styles.toggleKnob, available && styles.toggleKnobOn]} />
          </PressableScale>
        </View>
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      </MobileCard>

      <View style={styles.stats}>
        <StatCard label="طلبات متاحة" value={String(availableCount)} hint={available ? "جاهز" : "متوقف"} tone={available ? "green" : "warning"} />
        <StatCard label="اليوم" value={money(0)} hint="أرباح تجريبية" />
      </View>

      {currentRide ? (
        <MobileCard tone="hero" style={styles.currentRideCard}>
          <View style={styles.rowBetween}>
            <MobileBadge label={currentRide.status || "-"} tone="info" />
            <Text selectable style={styles.sectionTitle}>رحلتي الحالية</Text>
          </View>
          <InfoRow label="المسار" value={`${currentRide.pickup || "-"} ← ${currentRide.destination || "-"}`} accent />
          <MobileButton title="فتح الرحلة" compact variant="accent" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "current" })} />
        </MobileCard>
      ) : null}

      <View style={styles.actionGrid}>
        <MobileCard tone="action" compact onPress={() => dispatch({ type: "navigate", area: "driver", screen: "available" })} style={styles.actionTile}>
          <Text selectable style={styles.actionNumber}>{availableCount}</Text>
          <Text selectable style={styles.actionLabel}>الطلبات</Text>
        </MobileCard>
        <MobileCard tone="flat" compact onPress={() => dispatch({ type: "navigate", area: "driver", screen: "current" })} style={styles.actionTile}>
          <Text selectable style={styles.actionNumber}>↗</Text>
          <Text selectable style={styles.actionLabel}>رحلتي</Text>
        </MobileCard>
        <MobileCard tone="flat" compact onPress={() => dispatch({ type: "navigate", area: "driver", screen: "earnings" })} style={styles.actionTile}>
          <Text selectable style={styles.actionNumber}>₪</Text>
          <Text selectable style={styles.actionLabel}>الأرباح</Text>
        </MobileCard>
        <MobileCard tone="flat" compact onPress={() => dispatch({ type: "navigate", area: "driver", screen: "support" })} style={styles.actionTile}>
          <Text selectable style={styles.actionNumber}>?</Text>
          <Text selectable style={styles.actionLabel}>الدعم</Text>
        </MobileCard>
      </View>

      <MobileCard tone="glass">
        <InfoRow label="التحديث المباشر" value={state.socketStatus === "connected" ? "متصل" : "يدوي"} />
        <MobileButton title="خروج" compact variant="danger" onPress={logout} />
      </MobileCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cockpit: { gap: spacing.md, paddingVertical: spacing.lg, borderColor: depth.greenLine },
  cockpitTop: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  identity: { alignItems: "flex-end", gap: 3 },
  role: { color: colors.green, fontSize: 13, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  name: { color: colors.text, fontWeight: "900", fontSize: 27, textAlign: "right", writingDirection: "rtl" },
  vehicle: { color: colors.muted, textAlign: "right", fontWeight: "800", fontSize: 12, writingDirection: "rtl" },
  availabilityStrip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: depth.hairline,
    backgroundColor: "rgba(0, 0, 0, 0.16)"
  },
  availabilityCopy: { flex: 1, alignItems: "flex-end", gap: 3 },
  stats: { flexDirection: "row-reverse", gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  helper: { color: colors.muted, textAlign: "right", lineHeight: 19, fontWeight: "700", fontSize: 12, writingDirection: "rtl" },
  error: { color: colors.red, textAlign: "right", fontWeight: "800", fontSize: 12, writingDirection: "rtl" },
  toggle: {
    width: 60,
    height: 34,
    borderRadius: radii.pill,
    padding: 4,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.075)",
    borderWidth: 1,
    borderColor: depth.hairline
  },
  toggleOn: { alignItems: "flex-end", backgroundColor: "rgba(66, 231, 157, 0.16)", borderColor: "rgba(66, 231, 157, 0.4)", boxShadow: shadows.glow },
  toggleSaving: { opacity: 0.6 },
  toggleKnob: { width: 24, height: 24, borderRadius: radii.pill, backgroundColor: colors.muted },
  toggleKnobOn: { backgroundColor: colors.green },
  currentRideCard: { gap: spacing.xs },
  rowBetween: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  actionGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
  actionTile: { width: "47.5%", minHeight: 96, justifyContent: "space-between" },
  actionNumber: { color: colors.primary, fontSize: 23, fontWeight: "900", textAlign: "right" },
  actionLabel: { color: colors.text, fontSize: 14, fontWeight: "900", textAlign: "right", writingDirection: "rtl" }
});
