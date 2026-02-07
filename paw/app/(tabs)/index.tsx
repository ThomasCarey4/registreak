import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";

export default function AttendScreen() {
    const [code, setCode] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const colorScheme = useColorScheme() ?? "light";
    const tintColor = Colors[colorScheme].tint;

    useFocusEffect(
        useCallback(() => {
            setCode("");
            setSubmitted(false);
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }, []),
    );

    const handleCodeChange = (text: string) => {
        const digits = text.replace(/[^0-9]/g, "").slice(0, 4);
        setCode(digits);
        if (digits.length === 4) {
            Keyboard.dismiss();
            setSubmitted(true);
        }
    };

    const handleTapDigits = () => {
        if (!submitted) {
            inputRef.current?.focus();
        }
    };

    const handleReset = () => {
        setCode("");
        setSubmitted(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
                <View style={styles.header}>
                    <ThemedText style={styles.paw}>🐾</ThemedText>
                    <ThemedText type="title" style={styles.title}>
                        Mark Attendance
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>Enter the 4-digit code shown in your lecture</ThemedText>
                </View>

                <Pressable onPress={handleTapDigits} style={styles.codeContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.digitBox,
                                {
                                    borderColor: submitted
                                        ? "#4CAF50"
                                        : code.length === i
                                          ? tintColor
                                          : colorScheme === "dark"
                                            ? "#333"
                                            : "#D0D5DD",
                                    backgroundColor: submitted
                                        ? colorScheme === "dark"
                                            ? "#1a3a1a"
                                            : "#E8F5E9"
                                        : colorScheme === "dark"
                                          ? "#1C1C1E"
                                          : "#F9FAFB",
                                },
                            ]}
                        >
                            <ThemedText style={[styles.digit, submitted && { color: "#4CAF50" }]}>
                                {code[i] || ""}
                            </ThemedText>
                        </View>
                    ))}
                </Pressable>

                {submitted && (
                    <View style={styles.successContainer}>
                        <View style={styles.successBadge}>
                            <ThemedText style={styles.successIcon}>✓</ThemedText>
                        </View>
                        <ThemedText style={[styles.successText, { color: "#4CAF50" }]}>Attendance Recorded!</ThemedText>
                        <Pressable onPress={handleReset} style={[styles.resetButton, { backgroundColor: tintColor }]}>
                            <ThemedText style={styles.resetButtonText}>Enter Another Code</ThemedText>
                        </Pressable>
                    </View>
                )}

                <TextInput
                    ref={inputRef}
                    value={code}
                    onChangeText={handleCodeChange}
                    keyboardType="number-pad"
                    maxLength={4}
                    autoFocus
                    style={styles.hiddenInput}
                    caretHidden
                />
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 48,
    },
    paw: {
        fontSize: 56,
        marginBottom: 16,
    },
    title: {
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.5,
        textAlign: "center",
        lineHeight: 22,
    },
    codeContainer: {
        flexDirection: "row",
        gap: 12,
    },
    digitBox: {
        width: 68,
        height: 84,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    digit: {
        fontSize: 36,
        fontWeight: "700",
    },
    hiddenInput: {
        position: "absolute",
        opacity: 0,
        height: 0,
        width: 0,
    },
    successContainer: {
        alignItems: "center",
        marginTop: 36,
    },
    successBadge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#E8F5E9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    successIcon: {
        fontSize: 28,
        color: "#4CAF50",
        fontWeight: "700",
    },
    successText: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 20,
    },
    resetButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    resetButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
});
