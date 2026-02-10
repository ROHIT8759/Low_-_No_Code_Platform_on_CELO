import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Block Builder - No-Code Smart Contract Builder"
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = "image/png"

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                {/* Grid overlay */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            "linear-gradient(rgba(51, 65, 85, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(51, 65, 85, 0.3) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Decorative circles */}
                <div
                    style={{
                        position: "absolute",
                        top: -100,
                        left: -50,
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        background: "rgba(6, 182, 212, 0.05)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: -100,
                        right: -100,
                        width: 500,
                        height: 500,
                        borderRadius: "50%",
                        background: "rgba(99, 102, 241, 0.05)",
                    }}
                />

                {/* Logo */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 140,
                        height: 140,
                        borderRadius: 28,
                        background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.2))",
                        border: "3px solid rgba(34, 211, 238, 0.5)",
                        marginBottom: 40,
                    }}
                >
                    <span style={{ fontSize: 60 }}>🔗</span>
                </div>

                {/* Title */}
                <div
                    style={{
                        display: "flex",
                        fontSize: 72,
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #22d3ee, #3b82f6)",
                        backgroundClip: "text",
                        color: "transparent",
                        marginBottom: 16,
                    }}
                >
                    Block Builder
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 28,
                        color: "#94a3b8",
                        marginBottom: 40,
                    }}
                >
                    No-Code Smart Contract Builder for Celo Blockchain
                </div>

                {/* Features */}
                <div
                    style={{
                        display: "flex",
                        gap: 24,
                        padding: "16px 32px",
                        borderRadius: 50,
                        background: "#1e293b",
                        border: "1px solid #334155",
                    }}
                >
                    {["ERC20", "NFT", "DeFi", "Staking", "Governance"].map((feature, i) => (
                        <div
                            key={feature}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 18,
                                color: ["#22d3ee", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7"][i],
                            }}
                        >
                            ✦ {feature}
                        </div>
                    ))}
                </div>

                {/* URL */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 40,
                        fontSize: 20,
                        color: "#64748b",
                    }}
                >
                    celobuilder.vercel.app
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
