import { useMemo, useState, useRef, useCallback } from 'react';

interface DataPoint {
    label: string;
    value: number;
    color?: string;
}

interface ChartProps {
    type: 'line' | 'area' | 'bar' | 'donut';
    data: DataPoint[];
    label?: string;
    description?: string;
    color?: string;
    colors?: string[];
    height?: string;
}

const DEFAULT_COLOR = 'rgb(var(--s-accent))';
const CHART_COLORS = [
    '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

function formatValue(val: number): string {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val % 1 === 0 ? String(val) : val.toFixed(1);
}

export function Chart({ type, data, label, description, color, colors, height = '200px' }: ChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-s-border bg-s-surface p-5">
                {label && <p className="text-sm font-medium text-s-text mb-2">{label}</p>}
                <div className="flex items-center justify-center text-sm text-s-text-faint" style={{ height }}>
                    No data
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-s-border bg-s-surface p-5">
            {(label || description) && (
                <div className="mb-4">
                    {label && <p className="text-sm font-medium text-s-text">{label}</p>}
                    {description && <p className="text-xs text-s-text-muted mt-0.5">{description}</p>}
                </div>
            )}
            {type === 'donut' ? (
                <DonutChart data={data} colors={colors} height={height} />
            ) : (
                <CartesianChart type={type} data={data} color={color} height={height} />
            )}
        </div>
    );
}

// ─── Cartesian (Line / Area / Bar) ──────────────────────────

function CartesianChart({ type, data, color, height }: { type: 'line' | 'area' | 'bar'; data: DataPoint[]; color?: string; height: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const padding = { top: 8, right: 8, bottom: 24, left: 40 };
    const viewWidth = 400;
    const viewHeight = 180;
    const chartW = viewWidth - padding.left - padding.right;
    const chartH = viewHeight - padding.top - padding.bottom;

    const { points, yTicks } = useMemo(() => {
        const values = data.map((d) => d.value);
        const max = Math.max(...values, 1);
        const min = 0;
        const range = max - min || 1;

        const pts = data.map((d, i) => ({
            x: type === 'bar'
                ? padding.left + (i + 0.5) * (chartW / data.length)
                : padding.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
            y: padding.top + chartH - ((d.value - min) / range) * chartH,
            ...d,
        }));

        const tickCount = 4;
        const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
            const val = min + (range / tickCount) * i;
            return {
                value: val,
                y: padding.top + chartH - ((val - min) / range) * chartH,
            };
        });

        return { points: pts, yTicks: ticks };
    }, [data, chartW, chartH, type]);

    const strokeColor = color || DEFAULT_COLOR;
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;
    const barWidth = Math.max(4, (chartW / data.length) * 0.6);
    const barGap = (chartW / data.length) * 0.4;

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * viewWidth;

        let closest = 0;
        let closestDist = Infinity;
        for (let i = 0; i < points.length; i++) {
            const dist = Math.abs(points[i].x - mouseX);
            if (dist < closestDist) {
                closestDist = dist;
                closest = i;
            }
        }
        setActiveIndex(closest);
    }, [points]);

    const activePoint = activeIndex !== null ? points[activeIndex] : null;

    return (
        <div
            ref={containerRef}
            className="relative"
            style={{ height }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setActiveIndex(null)}
        >
            <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {yTicks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={padding.left} y1={tick.y}
                            x2={viewWidth - padding.right} y2={tick.y}
                            stroke="rgb(var(--s-border))" strokeWidth="0.5" strokeDasharray="3,3"
                        />
                        <text
                            x={padding.left - 4} y={tick.y + 3}
                            textAnchor="end" fontSize="8" fill="rgb(var(--s-text-faint))"
                        >
                            {formatValue(tick.value)}
                        </text>
                    </g>
                ))}

                {/* X labels */}
                {data.length <= 12 && points.map((p, i) => (
                    <text
                        key={i}
                        x={p.x}
                        y={viewHeight - 4}
                        textAnchor="middle" fontSize="7"
                        fill={activeIndex === i ? 'rgb(var(--s-text))' : 'rgb(var(--s-text-faint))'}
                        fontWeight={activeIndex === i ? '600' : '400'}
                    >
                        {p.label}
                    </text>
                ))}

                {/* Hover crosshair */}
                {activePoint && (
                    <line
                        x1={activePoint.x} y1={padding.top}
                        x2={activePoint.x} y2={padding.top + chartH}
                        stroke="rgb(var(--s-text-faint))" strokeWidth="0.5" strokeDasharray="2,2"
                        vectorEffect="non-scaling-stroke"
                    />
                )}

                {type === 'bar' ? (
                    points.map((p, i) => (
                        <rect
                            key={i}
                            x={padding.left + i * (chartW / data.length) + barGap / 2}
                            y={p.y}
                            width={barWidth}
                            height={padding.top + chartH - p.y}
                            rx="2"
                            fill={strokeColor}
                            opacity={activeIndex === null || activeIndex === i ? 0.85 : 0.35}
                            className="transition-opacity duration-100"
                        />
                    ))
                ) : (
                    <>
                        {type === 'area' && (
                            <path d={areaPath} fill={strokeColor} opacity="0.08" />
                        )}
                        <path
                            d={linePath}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                        {points.length <= 20 && points.map((p, i) => (
                            <circle
                                key={i}
                                cx={p.x} cy={p.y}
                                r={activeIndex === i ? 4 : 3}
                                fill={activeIndex === i ? strokeColor : 'rgb(var(--s-surface))'}
                                stroke={strokeColor}
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                                className="transition-all duration-100"
                            />
                        ))}
                    </>
                )}
            </svg>

            {/* Tooltip */}
            {activePoint && (
                <div
                    className="absolute pointer-events-none z-10"
                    style={{
                        left: `${(activePoint.x / viewWidth) * 100}%`,
                        top: `${(activePoint.y / viewHeight) * 100}%`,
                        transform: 'translate(-50%, -140%)',
                    }}
                >
                    <div
                        className="rounded-lg px-2.5 py-1.5 text-center shadow-lg"
                        style={{
                            background: 'rgb(var(--s-text))',
                            color: 'rgb(var(--s-bg))',
                        }}
                    >
                        <p className="text-[11px] font-medium">{formatValue(activePoint.value)}</p>
                        <p className="text-[9px] opacity-70">{activePoint.label}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Donut Chart ────────────────────────────────────────────

function DonutChart({ data, colors, height }: { data: DataPoint[]; colors?: string[]; height: string }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const paletteColors = colors || CHART_COLORS;

    const segments = useMemo(() => {
        let cumulative = 0;
        return data.map((d, i) => {
            const start = cumulative;
            const fraction = total > 0 ? d.value / total : 0;
            cumulative += fraction;
            return {
                ...d,
                start,
                fraction,
                percentage: total > 0 ? Math.round((d.value / total) * 100) : 0,
                color: d.color || paletteColors[i % paletteColors.length],
            };
        });
    }, [data, total, paletteColors]);

    const cx = 90;
    const cy = 90;
    const r = 70;
    const strokeWidth = 24;

    function arcPath(start: number, fraction: number): string {
        if (fraction >= 1) {
            return [
                `M ${cx} ${cy - r}`,
                `A ${r} ${r} 0 1 1 ${cx} ${cy + r}`,
                `A ${r} ${r} 0 1 1 ${cx} ${cy - r}`,
            ].join(' ');
        }
        const startAngle = start * 2 * Math.PI - Math.PI / 2;
        const endAngle = (start + fraction) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = fraction > 0.5 ? 1 : 0;
        return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
    }

    const activeSeg = activeIndex !== null ? segments[activeIndex] : null;

    return (
        <div className="flex items-center gap-6" style={{ height }}>
            <svg viewBox="0 0 180 180" className="h-full aspect-square shrink-0">
                {segments.map((seg, i) => (
                    <path
                        key={i}
                        d={arcPath(seg.start, seg.fraction)}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={activeIndex === i ? strokeWidth + 4 : strokeWidth}
                        strokeLinecap="round"
                        opacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                    />
                ))}
                {/* Center text — show active or total */}
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20" fontWeight="600" fill="rgb(var(--s-text))">
                    {activeSeg ? `${activeSeg.percentage}%` : (total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total)}
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="rgb(var(--s-text-muted))">
                    {activeSeg ? activeSeg.label : 'Total'}
                </text>
            </svg>

            {/* Legend */}
            <div className="space-y-1.5 min-w-0">
                {segments.map((seg, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 rounded px-1.5 py-1 -mx-1.5 cursor-pointer transition-colors"
                        style={{ background: activeIndex === i ? 'rgb(var(--s-hover))' : undefined }}
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                        <span className="text-xs text-s-text-muted truncate">{seg.label}</span>
                        <span className="text-xs font-medium text-s-text ml-auto tabular-nums">{seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Sparkline ──────────────────────────────────────────────

export function Sparkline({ data, color, height = '32px' }: { data: DataPoint[]; color?: string; height?: string }) {
    const strokeColor = color || DEFAULT_COLOR;

    if (!data || data.length < 2) return null;

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const w = 100;
    const h = 24;

    const pts = values.map((v, i) => ({
        x: (i / (values.length - 1)) * w,
        y: h - ((v - min) / range) * h,
    }));

    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none">
            <path
                d={path}
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}
