# SEIKO Style デジタル置時計アプリ (iPhone / iOS 対応)

写真の SEIKO 電波デジタル置時計（カレンダー・温湿度計付き反転液晶クロック）を再現した iPhone 向けアプリです。
**iPhoneのGPS位置情報と気象庁（JMA）公式アメダスデータ・Open-Meteo APIと連携し、現在地のリアルタイム気温・湿度を自動取得して表示**します。

---

## 2つの実行方法

### 方法1. iPhoneのSafariで今すぐ使う (PWA / Webアプリ版) ★おすすめ・手軽

XcodeやMacを使わずに、iPhoneの実機で今すぐ全画面の置き時計アプリとして利用できます。

1. **ローカルサーバーを起動する**:
   PC上で以下のコマンドを実行します：
   ```powershell
   python -m http.server 8080 --directory "apps/seiko-digital-clock"
   ```
2. **iPhoneからアクセスする**:
   PCと同一Wi-Fi環境にあるiPhoneの Safari で `http://<PCのローカルIPアドレス>:8080` を開きます。
3. **位置情報の利用を許可する**:
   起動時に「"卓上時計"が現在地の利用を求めています」と表示されたら**「許可」**をタップします。
   → iPhoneのGPS座標から最寄りのアメダス観測所の最新「気温」「湿度」が自動反映されます。
4. **ホーム画面に追加する**:
   - Safari 画面下部の「共有（四角に上矢印）」アイコンをタップ
   - **「ホーム画面に追加」** を選択
   - アプリアイコン「卓上時計」が作成されます
5. **起動する**:
   - ホーム画面のアイコンをタップすると、URLバーのない**完全な全画面アプリ**として起動します。
   - iPhone を横向き（充電スタンド等）に置くと、写真通りの迫力ある置き時計になります。

---

### 方法2. Xcode でネイティブビルドする (SwiftUI 版)

Mac 環境で Xcode を使用してネイティブ iOS アプリとしてビルド・インストールする場合の手順です。

1. **Xcode を起動** し、`New Project` → `iOS` → `App` を選択。
2. Project Name: `DigitalClock`、Interface: `SwiftUI`、Language: `Swift` を指定。
3. `Info.plist` に位置情報権限の利用目的キーを追加：
   - `NSLocationWhenInUseUsageDescription`: `現在地のリアルタイム気温・湿度を表示するために位置情報を利用します。`
4. プロジェクト内の既存ファイルを、`ios-swiftui/` 内の以下のファイルで置き換えます：
   - `DigitalClockApp.swift`
   - `ContentView.swift`
   - `ClockViewModel.swift`（CoreLocation + 気象API自動連動実装済み）
   - `SevenSegmentView.swift`
5. **General 設定**:
   - **Deployment Target**: iOS 15.0 以上
   - **Device Orientation**: `Landscape Left`, `Landscape Right`（横向き推奨）
6. iPhone を Mac に USB 接続し、ターゲットデバイスに選択して **Run (⌘ + R)** を実行します。

---

## 温湿度自動取得の仕組み（チャレンジ内容）

1. **GPS 測位**:
   - iPhone の `navigator.geolocation`（SwiftUIでは `CLLocationManager`）で現在地の緯度経度を取得。
2. **最寄り観測所の自動判定**:
   - 日本全国 1,280箇所以上の気象庁アメダス観測所から、現在地から最も近い観測所を自動計算。
3. **気象庁（JMA）最新アメダス実測値の取得**:
   - 気象庁公式の最新観測データ（毎時10分更新）をフェッチし、気温・湿度を即座に液晶ディスプレイへ反映。
   - 画面上部に「札幌 (13.1℃ / 74% 17:40観測)」のように観測地点名と実測時刻を表示。
4. **安心のフォールバック機能**:
   - 屋内等でGPSが取れない場合や未許可の場合でも、設定画面から「東京」「大阪」「札幌」などの主要都市プリセットへ即座に切替可能。
