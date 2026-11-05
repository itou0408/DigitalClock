import SwiftUI

struct ContentView: View {
    @StateObject private var vm = ClockViewModel()
    @State private var showSettings = false
    @State private var colonVisible = true
    
    var body: some View {
        GeometryReader { geo in
            let isLandscape = geo.size.width > geo.size.height
            
            ZStack {
                // Background
                Color(red: 0.05, green: 0.06, blue: 0.07)
                    .ignoresSafeArea()
                
                // Clock Body (Bezel)
                VStack(spacing: 0) {
                    ZStack {
                        // Clock Physical Frame
                        RoundedRectangle(cornerRadius: 24, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color(red: 0.15, green: 0.17, blue: 0.20),
                                        Color(red: 0.08, green: 0.09, blue: 0.11),
                                        Color(red: 0.04, green: 0.05, blue: 0.06)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 24, style: .continuous)
                                    .stroke(Color(white: 0.22), lineWidth: 2)
                            )
                            .shadow(color: .black.opacity(0.85), radius: 30, x: 0, y: 15)
                        
                        // SEIKO Logo
                        VStack {
                            HStack(alignment: .firstTextBaseline, spacing: 8) {
                                Text("SEIKO")
                                    .font(.system(size: 14, weight: .black, design: .monospaced))
                                    .foregroundColor(Color(white: 0.55))
                                    .tracking(2.5)
                                Text("RADIO CONTROLLED")
                                    .font(.system(size: 8, weight: .bold))
                                    .foregroundColor(Color(white: 0.35))
                                    .tracking(1.5)
                                Spacer()
                            }
                            .padding(.top, 14)
                            .padding(.leading, 32)
                            Spacer()
                        }
                        
                        // LCD Glass Screen
                        VStack(spacing: 0) {
                            // Top Status Bar (Radio wave icon & Location)
                            HStack {
                                HStack(spacing: 4) {
                                    Image(systemName: "location.fill")
                                        .font(.system(size: 10))
                                    Text(vm.locationName)
                                        .font(.system(size: 10, weight: .bold))
                                }
                                .foregroundColor(vm.currentTheme.activeColor.opacity(0.85))
                                
                                Spacer()
                                
                                HStack(spacing: 6) {
                                    Image(systemName: "antenna.radiowaves.left.and.right")
                                        .font(.system(size: 12, weight: .bold))
                                    Text("WAVE")
                                        .font(.system(size: 10, weight: .bold))
                                }
                                .foregroundColor(vm.currentTheme.activeColor)
                                .shadow(color: vm.currentTheme.activeColor.opacity(0.6), radius: 3)
                            }
                            .padding(.top, 8)
                            .padding(.horizontal, 16)
                            
                            Spacer()
                            
                            // Main Time Row: HH : MM SS
                            HStack(alignment: .firstTextBaseline, spacing: 8) {
                                HStack(spacing: 4) {
                                    Single7SegmentView(digit: vm.hoursString.first ?? "0", activeColor: vm.currentTheme.activeColor, inactiveColor: vm.currentTheme.inactiveColor)
                                    Single7SegmentView(digit: vm.hoursString.last ?? "0", activeColor: vm.currentTheme.activeColor, inactiveColor: vm.currentTheme.inactiveColor)
                                }
                                .frame(height: isLandscape ? geo.size.height * 0.38 : geo.size.width * 0.28)
                                
                                // Blinking Colon
                                VStack(spacing: isLandscape ? 24 : 16) {
                                    Circle()
                                        .fill(colonVisible ? vm.currentTheme.activeColor : vm.currentTheme.inactiveColor)
                                        .frame(width: 12, height: 12)
                                        .shadow(color: colonVisible ? vm.currentTheme.activeColor.opacity(0.8) : .clear, radius: 4)
                                    Circle()
                                        .fill(colonVisible ? vm.currentTheme.activeColor : vm.currentTheme.inactiveColor)
                                        .frame(width: 12, height: 12)
                                        .shadow(color: colonVisible ? vm.currentTheme.activeColor.opacity(0.8) : .clear, radius: 4)
                                }
                                
                                HStack(spacing: 4) {
                                    Single7SegmentView(digit: vm.minutesString.first ?? "0", activeColor: vm.currentTheme.activeColor, inactiveColor: vm.currentTheme.inactiveColor)
                                    Single7SegmentView(digit: vm.minutesString.last ?? "0", activeColor: vm.currentTheme.activeColor, inactiveColor: vm.currentTheme.inactiveColor)
                                }
                                .frame(height: isLandscape ? geo.size.height * 0.38 : geo.size.width * 0.28)
                                
                                // Seconds
                                HStack(spacing: 3) {
                                    Single7SegmentView(digit: vm.secondsString.first ?? "0", activeColor: vm.currentTheme.activeColor, inactiveColor: vm.currentTheme.inactiveColor)
                                    Single7SegmentView(digit: vm.secondsString.last ?? "0", activeColor: vm.currentTheme.activeColor, inactiveColor: vm.currentTheme.inactiveColor)
                                }
                                .frame(height: isLandscape ? geo.size.height * 0.20 : geo.size.width * 0.15)
                                .padding(.leading, 8)
                            }
                            
                            Spacer()
                            
                            // Horizontal LCD Divider
                            Rectangle()
                                .fill(vm.currentTheme.activeColor.opacity(0.3))
                                .frame(height: 2)
                                .padding(.horizontal, 12)
                            
                            Spacer()
                            
                            // Bottom Info Row: Temp, Humidity, Date/Day
                            HStack(alignment: .center) {
                                // Temperature
                                HStack(alignment: .firstTextBaseline, spacing: 2) {
                                    Text(String(format: "%.1f", vm.temperature))
                                        .font(.system(size: isLandscape ? 38 : 28, weight: .bold, design: .monospaced))
                                    Text("℃")
                                        .font(.system(size: isLandscape ? 20 : 15, weight: .bold))
                                }
                                .foregroundColor(vm.currentTheme.activeColor)
                                .shadow(color: vm.currentTheme.activeColor.opacity(0.5), radius: 4)
                                
                                Spacer()
                                Divider()
                                    .background(Color.white.opacity(0.2))
                                    .frame(height: 35)
                                Spacer()
                                
                                // Humidity
                                HStack(alignment: .firstTextBaseline, spacing: 2) {
                                    Text("\(vm.humidity)")
                                        .font(.system(size: isLandscape ? 38 : 28, weight: .bold, design: .monospaced))
                                    Text("%")
                                        .font(.system(size: isLandscape ? 20 : 15, weight: .bold))
                                }
                                .foregroundColor(vm.currentTheme.activeColor)
                                .shadow(color: vm.currentTheme.activeColor.opacity(0.5), radius: 4)
                                
                                Spacer()
                                Divider()
                                    .background(Color.white.opacity(0.2))
                                    .frame(height: 35)
                                Spacer()
                                
                                // Date & Day
                                HStack(alignment: .center, spacing: 10) {
                                    Text(vm.dateString)
                                        .font(.system(size: isLandscape ? 38 : 28, weight: .bold, design: .monospaced))
                                        .foregroundColor(vm.currentTheme.activeColor)
                                    
                                    Text(vm.dayKanji)
                                        .font(.system(size: isLandscape ? 26 : 20, weight: .black))
                                        .foregroundColor(vm.currentTheme.activeColor)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 4)
                                                .stroke(vm.currentTheme.activeColor, lineWidth: 2)
                                        )
                                    
                                    Text(vm.rokuyo)
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundColor(vm.currentTheme.activeColor.opacity(0.85))
                                }
                                .shadow(color: vm.currentTheme.activeColor.opacity(0.5), radius: 4)
                            }
                            .padding(.horizontal, 24)
                            .padding(.bottom, 12)
                        }
                        .padding(14)
                        .background(
                            ZStack {
                                Color(red: 0.03, green: 0.04, blue: 0.05)
                                // Glass reflection sheen
                                LinearGradient(
                                    colors: [Color.white.opacity(0.06), Color.clear],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            }
                        )
                        .cornerRadius(14)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color.black, lineWidth: 3)
                        )
                        .padding(20)
                        .padding(.top, 18)
                    }
                    .frame(maxWidth: 880, maxHeight: isLandscape ? 480 : 420)
                    .brightness(vm.brightness - 1.0)
                    
                    // Silver Bottom Lip
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [Color(white: 0.4), Color(white: 0.85), Color(white: 0.4)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: min(geo.size.width * 0.8, 780), height: 6)
                        .padding(.top, -3)
                }
                .padding(16)
                
                // Settings button overlay (bottom right)
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Button(action: { showSettings.trueOrToggle() }) {
                            Image(systemName: "gearshape.fill")
                                .font(.system(size: 20))
                                .foregroundColor(.white.opacity(0.6))
                                .padding(12)
                                .background(Color.white.opacity(0.12))
                                .clipShape(Circle())
                        }
                        .padding(20)
                    }
                }
            }
        }
        .onAppear {
            UIApplication.shared.isIdleTimerDisabled = true // スリープ防止
            Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
                colonVisible.toggle()
            }
        }
        .sheet(isPresented: $showSettings) {
            SettingsView(vm: vm)
        }
    }
}

extension Bool {
    mutating func trueOrToggle() {
        self.toggle()
    }
}

struct SettingsView: View {
    @ObservedObject var vm: ClockViewModel
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("カラーテーマ")) {
                    Picker("テーマ", selection: $vm.currentTheme) {
                        ForEach(ClockViewModel.ThemeColor.allCases) { theme in
                            Text(theme.rawValue).tag(theme)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section(header: Text("明るさ調整 (ディマー)")) {
                    Slider(value: $vm.brightness, in: 0.2...1.0)
                }
                
                Section(header: Text("表示形式")) {
                    Toggle("24時間表示", isOn: $vm.is24Hour)
                }
                
                Section(header: Text("温度・湿度手動調整")) {
                    HStack {
                        Text("温度: \(String(format: "%.1f", vm.temperature)) ℃")
                        Slider(value: $vm.temperature, in: 10.0...40.0, step: 0.1)
                    }
                    HStack {
                        Text("湿度: \(vm.humidity) %")
                        Slider(value: Binding(
                            get: { Double(vm.humidity) },
                            set: { vm.humidity = Int($0) }
                        ), in: 10.0...95.0, step: 1.0)
                    }
                }
            }
            .navigationBarTitle("時計の設定", displayMode: .inline)
            .navigationBarItems(trailing: Button("完了") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }
}
