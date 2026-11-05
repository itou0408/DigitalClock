import Foundation
import SwiftUI
import Combine
import CoreLocation

class ClockViewModel: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var hoursString: String = "18"
    @Published var minutesString: String = "20"
    @Published var secondsString: String = "56"
    @Published var dateString: String = "5/21"
    @Published var dayKanji: String = "月"
    @Published var rokuyo: String = "友引"
    
    @Published var temperature: Double = 26.6
    @Published var humidity: Int = 44
    @Published var is24Hour: Bool = true
    @Published var locationName: String = "GPS測位中..."
    @Published var isSyncingWeather: Bool = false
    
    // カラーテーマ
    enum ThemeColor: String, CaseIterable, Identifiable {
        case green = "クラシックグリーン"
        case cyan = "クールシアン"
        case amber = "アンバー"
        case white = "ホワイト"
        case red = "ナイトレッド"
        
        var id: String { rawValue }
        
        var activeColor: Color {
            switch self {
            case .green: return Color(red: 0.65, green: 1.0, blue: 0.52)
            case .cyan:  return Color(red: 0.31, green: 0.90, blue: 1.0)
            case .amber: return Color(red: 1.0, green: 0.67, blue: 0.20)
            case .white: return Color(red: 0.92, green: 0.96, blue: 1.0)
            case .red:   return Color(red: 1.0, green: 0.25, blue: 0.25)
            }
        }
        
        var inactiveColor: Color {
            return activeColor.opacity(0.08)
        }
    }
    
    @Published var currentTheme: ThemeColor = .green
    @Published var brightness: Double = 1.0
    
    private var timer: AnyCancellable?
    private var weatherTimer: AnyCancellable?
    private let locationManager = CLLocationManager()
    private let dayKanjiList = ["日", "月", "火", "水", "木", "金", "土"]
    private let rokuyoList = ["大安", "赤口", "先勝", "友引", "先負", "仏滅"]
    
    override init() {
        super.init()
        updateTime()
        startTimer()
        setupLocationManager()
    }
    
    func startTimer() {
        timer = Timer.publish(every: 0.5, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.updateTime()
            }
        
        // 10分ごとに気象データを再フェッチ
        weatherTimer = Timer.publish(every: 600, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.locationManager.requestLocation()
            }
    }
    
    func setupLocationManager() {
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyKilometer
        locationManager.requestWhenInUseAuthorization()
        locationManager.requestLocation()
    }
    
    // CLLocationManagerDelegate
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.first else { return }
        fetchWeather(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude)
        
        // 逆ジオコーディングで市区町村名を取得
        let geocoder = CLGeocoder()
        geocoder.reverseGeocodeLocation(location) { [weak self] placemarks, _ in
            if let placemark = placemarks?.first {
                let city = placemark.locality ?? placemark.administrativeArea ?? "GPS現在地"
                DispatchQueue.main.async {
                    self?.locationName = city
                }
            }
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location manager error: \(error.localizedDescription)")
        // GPS失敗時は東京にフォールバック
        fetchWeather(latitude: 35.6895, longitude: 139.6917)
        DispatchQueue.main.async {
            self.locationName = "東京 (固定)"
        }
    }
    
    // Open-Meteo API からリアルタイム気温・湿度を取得
    func fetchWeather(latitude: Double, longitude: Double) {
        DispatchQueue.main.async {
            self.isSyncingWeather = true
        }
        
        let urlStr = "https://api.open-meteo.com/v1/forecast?latitude=\(latitude)&longitude=\(longitude)&current=temperature_2m,relative_humidity_2m&timezone=auto"
        guard let url = URL(string: urlStr) else { return }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.isSyncingWeather = false
            }
            guard let data = data, error == nil else { return }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let current = json["current"] as? [String: Any],
                   let temp = current["temperature_2m"] as? Double,
                   let hum = current["relative_humidity_2m"] as? Int {
                    DispatchQueue.main.async {
                        self?.temperature = temp
                        self?.humidity = hum
                        print("[Weather] Updated via API: \(temp)℃, \(hum)%")
                    }
                }
            } catch {
                print("JSON parse error: \(error)")
            }
        }.resume()
    }
    
    func updateTime() {
        let now = Date()
        let cal = Calendar.current
        
        var h = cal.component(.hour, from: now)
        if !is24Hour {
            h = h % 12
            if h == 0 { h = 12 }
        }
        let m = cal.component(.minute, from: now)
        let s = cal.component(.second, from: now)
        
        hoursString = String(format: "%02d", h)
        minutesString = String(format: "%02d", m)
        secondsString = String(format: "%02d", s)
        
        let month = cal.component(.month, from: now)
        let day = cal.component(.day, from: now)
        dateString = "\(month)/\(day)"
        
        let weekday = cal.component(.weekday, from: now)
        dayKanji = dayKanjiList[(weekday - 1) % 7]
        
        let baseDate = Calendar.current.date(from: DateComponents(year: 2026, month: 1, day: 1)) ?? now
        let diff = cal.dateComponents([.day], from: baseDate, to: now).day ?? 0
        let rIndex = abs((month + day + diff) % 6)
        rokuyo = rokuyoList[rIndex]
    }
}
