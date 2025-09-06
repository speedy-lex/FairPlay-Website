# THIS FILE IS AUTO-GENERATED. DO NOT MODIFY!!

# Copyright 2020-2023 Tauri Programme within The Commons Conservancy
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: MIT

-keep class com.fairplay.client.* {
  native <methods>;
}

-keep class com.fairplay.client.WryActivity {
  public <init>(...);

  void setWebView(com.fairplay.client.RustWebView);
  java.lang.Class getAppClass(...);
  java.lang.String getVersion();
}

-keep class com.fairplay.client.Ipc {
  public <init>(...);

  @android.webkit.JavascriptInterface public <methods>;
}

-keep class com.fairplay.client.RustWebView {
  public <init>(...);

  void loadUrlMainThread(...);
  void loadHTMLMainThread(...);
  void evalScript(...);
}

-keep class com.fairplay.client.RustWebChromeClient,com.fairplay.client.RustWebViewClient {
  public <init>(...);
}
