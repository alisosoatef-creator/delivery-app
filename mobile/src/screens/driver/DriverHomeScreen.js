import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandMark, InfoRow, MobileBadge, MobileButton, MobileCard, ScreenContainer, StatCard } from "../../components/ui";
import { updateDriverOnlineStatus } from "../../services/driverApi";
import { clearMobileSession, saveMobileSession } from "../../services/sessionStorage";
import { connectMobileSocket, disconnectMobileSocket, subscribeToDriverEvents } from "../../services/socketClient";
import { useMobileApp } from "../../store/mobileStore";
import { apiErrorMessage } from "../../utils/errorUtils";
import { colors, money, spacing } from "../../utils/mobileTheme";

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
      setError("بيانات الكابتن غير مكتملة. سجّل الدخول مرة أخرى.");
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
      dispatch({ type: "toast", message: nextAvailable ? "أصبحت متاحًا لاستقبال الطلبات." : "أصبحت غير متاح للطلبات الجديدة." });
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
    <ScreenContainer showHeader={false}>
      <MobileCard tone="hero" style={styles.headerCard}>
        <View style={styles.headerTop}>
          <MobileBadge label={available ? "متاح لاستقبال الطلبات" : "غير متاح"} tone={available ? "success" : "warning"} />
          <BrandMark compact />
        </View>
        <Text selectable style={styles.title}>لوحة الكابتن</Text>
        <Text selectable style={styles.name}>{driver.fullName || state.currentUser?.fullName || "كابتن وصل"}</Text>
        <Text selectable style={styles.vehicle}>{driver.vehicleType || driver.vehicle || "مركبة"} · {driver.vehiclePlate || driver.plate || "بدون لوحة"}</Text>
      </MobileCard>

      <View style={styles.stats}>
        <StatCard label="طلبات متاحة" value={String(availableCount)} hint={available ? "جاهز" : "متوقف"} tone={available ? "green" : "warning"} />
        <StatCard label="اليوم" value={money(0)} hint="أرباح تجريبية" />
      </View>

      <MobileCard tone="flat" style={styles.availabilityCard}>
        <View style={styles.availabilityHeader}>
          <View style={styles.availabilityCopy}>
            <Text selectable style={styles.sectionTitle}>حالة التوفر</Text>
            <Text selectable style={styles.helper}>{available ? "أنت متاح الآن، ويمكنك متابعة الطلبات الجديدة." : "أنت غير متاح. استقبال الطلبات الجديدة متوقف مؤقتًا."}</Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: available, disabled: status === "saving" }}
            accessibilityLabel="تبديل حالة توفر الكابتن"
            onPress={toggleAvailability}
            disabled={status === "saving"}
            style={[styles.toggle, available && styles.toggleOn, status === "saving" && styles.toggleSaving]}
          >
            <View style={[styles.toggleKnob, available && styles.toggleKnobOn]} />
          </Pressable>
        </View>
        {error ? <Text selectable style={styles.error}>{error}</Text> : null}
      </MobileCard>

      {currentRide ? (
        <MobileCard tone="soft" style={styles.currentRideCard}>
          <Text selectable style={styles.sectionTitle}>رحلتي الحالية</Text>
          <Text selectable numberOfLines={1} style={styles.helper}>{currentRide.pickup || "-"} ← {currentRide.destination || "-"}</Text>
          <InfoRow label="الحالة" value={currentRide.status || "-"} accent />
          <MobileButton title="فتح الرحلة" compact variant="accent" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "current" })} />
        </MobileCard>
      ) : null}

      <MobileCard tone="flat">
        <Text selectable style={styles.sectionTitle}>إجراءات سريعة</Text>
        <View style={styles.actions}>
          <MobileButton title="عرض الطلبات" variant="accent" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "available" })} />
          <MobileButton title="رحلتي الحالية" variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "current" })} />
        </View>
        <InfoRow label="التحديث المباشر" value={state.socketStatus === "connected" ? "متصل" : "يدوي"} />
      </MobileCard>

      <View style={styles.secondaryActions}>
        <MobileButton title="الأرباح" compact variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "earnings" })} />
        <MobileButton title="الدعم" compact variant="secondary" onPress={() => dispatch({ type: "navigate", area: "driver", screen: "support" })} />
        <MobileButton title="خروج" compact variant="danger" onPress={logout} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: { gap: spacing.xs },
  headerTop: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  title: { color: colors.primary, fontSize: 13, fontWeight: "800", textAlign: "right" },
  name: { color: colors.text, fontWeight: "900", fontSize: 24, textAlign: "right" },
  vehicle: { color: colors.muted, textAlign: "right", fontWeight: "700", fontSize: 12 },
  stats: { flexDirection: "row-reverse", gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900", textAlign: "right" },
  helper: { color: colors.muted, textAlign: "right", lineHeight: 19, fontWeight: "700", fontSize: 12 },
  error: { color: colors.red, textAlign: "right", fontWeight: "800", fontSize: 12 },
  availabilityCard: { gap: spacing.xs },
  availabilityHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  availabilityCopy: { flex: 1, alignItems: "flex-end", gap: 3 },
  toggle: {
    width: 54,
    height: 31,
    borderRadius: 999,
    padding: 4,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.border
  },
  toggleOn: {
    alignItems: "flex-end",
    backgroundColor: "rgba(66, 231, 156, 0.16)",
    borderColor: "rgba(66, 231, 156, 0.4)"
  },
  toggleSaving: { opacity: 0.6 },
  toggleKnob: { width: 21, height: 21, borderRadius: 999, backgroundColor: colors.muted },
  toggleKnobOn: { backgroundColor: colors.green },
  currentRideCard: { gap: spacing.xs },
  actions: { gap: spacing.sm },
  secondaryActions: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs }
});
