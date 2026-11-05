import SwiftUI

/// 7セグメントの各セグメント (a, b, c, d, e, f, g) を描画するShape
struct SegmentShape: Shape {
    let index: Int // 0: top(a), 1: top-right(b), 2: bottom-right(c), 3: bottom(d), 4: bottom-left(e), 5: top-left(f), 6: center(g)
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width
        let h = rect.height
        let thickness = min(w, h) * 0.18
        let halfT = thickness / 2
        
        switch index {
        case 0: // a: top horizontal
            path.move(to: CGPoint(x: thickness, y: halfT))
            path.addLine(to: CGPoint(x: w - thickness, y: halfT))
            path.addLine(to: CGPoint(x: w - thickness * 1.5, y: thickness))
            path.addLine(to: CGPoint(x: thickness * 1.5, y: thickness))
            path.closeSubpath()
            
        case 1: // b: top-right vertical
            path.move(to: CGPoint(x: w - halfT, y: thickness))
            path.addLine(to: CGPoint(x: w - halfT, y: h/2 - halfT))
            path.addLine(to: CGPoint(x: w - thickness, y: h/2 - thickness))
            path.addLine(to: CGPoint(x: w - thickness, y: thickness * 1.5))
            path.closeSubpath()
            
        case 2: // c: bottom-right vertical
            path.move(to: CGPoint(x: w - halfT, y: h/2 + halfT))
            path.addLine(to: CGPoint(x: w - halfT, y: h - thickness))
            path.addLine(to: CGPoint(x: w - thickness, y: h - thickness * 1.5))
            path.addLine(to: CGPoint(x: w - thickness, y: h/2 + thickness))
            path.closeSubpath()
            
        case 3: // d: bottom horizontal
            path.move(to: CGPoint(x: thickness, y: h - halfT))
            path.addLine(to: CGPoint(x: w - thickness, y: h - halfT))
            path.addLine(to: CGPoint(x: w - thickness * 1.5, y: h - thickness))
            path.addLine(to: CGPoint(x: thickness * 1.5, y: h - thickness))
            path.closeSubpath()
            
        case 4: // e: bottom-left vertical
            path.move(to: CGPoint(x: halfT, y: h/2 + halfT))
            path.addLine(to: CGPoint(x: halfT, y: h - thickness))
            path.addLine(to: CGPoint(x: thickness, y: h - thickness * 1.5))
            path.addLine(to: CGPoint(x: thickness, y: h/2 + thickness))
            path.closeSubpath()
            
        case 5: // f: top-left vertical
            path.move(to: CGPoint(x: halfT, y: thickness))
            path.addLine(to: CGPoint(x: halfT, y: h/2 - halfT))
            path.addLine(to: CGPoint(x: thickness, y: h/2 - thickness))
            path.addLine(to: CGPoint(x: thickness, y: thickness * 1.5))
            path.closeSubpath()
            
        case 6: // g: center horizontal
            path.move(to: CGPoint(x: thickness * 1.2, y: h/2))
            path.addLine(to: CGPoint(x: thickness * 1.6, y: h/2 - halfT))
            path.addLine(to: CGPoint(x: w - thickness * 1.6, y: h/2 - halfT))
            path.addLine(to: CGPoint(x: w - thickness * 1.2, y: h/2))
            path.addLine(to: CGPoint(x: w - thickness * 1.6, y: h/2 + halfT))
            path.addLine(to: CGPoint(x: thickness * 1.6, y: h/2 + halfT))
            path.closeSubpath()
            
        default:
            break
        }
        return path
    }
}

/// 1文字分の7セグメント数字ビュー
struct Single7SegmentView: View {
    let digit: Character
    var activeColor: Color = Color(red: 0.60, green: 1.0, blue: 0.52)
    var inactiveColor: Color = Color(red: 0.60, green: 1.0, blue: 0.52).opacity(0.08)
    
    // 各数字 0-9 に対応するセグメントON/OFF (a, b, c, d, e, f, g)
    private static let segmentTable: [Character: [Bool]] = [
        "0": [true,  true,  true,  true,  true,  true,  false],
        "1": [false, true,  true,  false, false, false, false],
        "2": [true,  true,  false, true,  true,  false, true ],
        "3": [true,  true,  true,  true,  false, false, true ],
        "4": [false, true,  true,  false, false, true,  true ],
        "5": [true,  false, true,  true,  false, true,  true ],
        "6": [true,  false, true,  true,  true,  true,  true ],
        "7": [true,  true,  true,  false, false, false, false],
        "8": [true,  true,  true,  true,  true,  true,  true ],
        "9": [true,  true,  true,  true,  false, true,  true ],
        "-": [false, false, false, false, false, false, true ],
        " ": [false, false, false, false, false, false, false]
    ]
    
    var body: some View {
        let activeStates = Self.segmentTable[digit] ?? [false, false, false, false, false, false, false]
        
        ZStack {
            ForEach(0..<7, id: \.self) { i in
                SegmentShape(index: i)
                    .fill(activeStates[i] ? activeColor : inactiveColor)
                    .shadow(color: activeStates[i] ? activeColor.opacity(0.6) : .clear, radius: 4)
            }
        }
        .aspectRatio(0.55, contentMode: .fit)
    }
}
