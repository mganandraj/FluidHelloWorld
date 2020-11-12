package com.fluidhelloworld;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactRootView;
import com.facebook.react.devsupport.DoubleTapReloadRecognizer;

public class MultiActivity extends AppCompatActivity {

    private DoubleTapReloadRecognizer mDoubleTapReloadRecognizer;

    public class MyWebChromeClient extends WebChromeClient {
        //Handle javascript alerts:
        @Override
        public boolean onJsAlert(WebView view, String url, String message, final android.webkit.JsResult result) {
            Log.d("alert", message);
            Toast.makeText(MultiActivity.this, message, 3000).show();
            result.confirm();
            return true;
        }

        @Override
        public boolean onConsoleMessage(ConsoleMessage cm) {
            Log.v("ChromeClient", cm.message() + " -- From line "
                    + cm.lineNumber() + " of "
                    + cm.sourceId() );
            return true;
        }

    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_multi);

        mDoubleTapReloadRecognizer = new DoubleTapReloadRecognizer();

        final ViewGroup dicesHost = (ViewGroup) this.findViewById(R.id.dicesHostHost);
        final ViewGroup dashBoardHost = (ViewGroup) this.findViewById(R.id.dashBoardHost);

        Button addReactNativeDiceButton = new Button(this);
        addReactNativeDiceButton.setText("Add React Native Dice");
        addReactNativeDiceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                ReactRootView fluidReactRootView = new ReactRootView(MultiActivity.this);
                fluidReactRootView.startReactApplication(((MainApplication)getApplication()).getReactNativeHost().getReactInstanceManager(), "FluidHelloWorld");
                dicesHost.addView(fluidReactRootView);
            }
        });

        Button addWebViewDiceButton = new Button(this);
        addWebViewDiceButton.setText("Add WebView Dice");
        addWebViewDiceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                WebView webView = new WebView(MultiActivity.this);
                webView.setWebViewClient(new WebViewClient());
                webView.setWebChromeClient(new MyWebChromeClient());

                WebSettings settings = webView.getSettings();

                settings.setLoadsImagesAutomatically(true);
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);
                settings.setAppCacheEnabled(true);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    settings.setSafeBrowsingEnabled(false);
                    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                }
                webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
                }

                // Extras tried for Android 9.0, can be removed if want.
                settings.setAllowContentAccess(true);
                settings.setAllowFileAccess(true);
                settings.setBlockNetworkImage(false);

                webView.loadUrl("http://localhost:8080");
                // webView.loadUrl("http://127.0.0.1:8080");
                // webView.loadUrl("http://192.168.232.2:8080");

                dicesHost.addView(webView);
            }
        });

        dashBoardHost.addView(addReactNativeDiceButton);
        dashBoardHost.addView(addWebViewDiceButton);

        ReactRootView fluidReactRootView1 = new ReactRootView(this);
        fluidReactRootView1.startReactApplication(((MainApplication)this.getApplication()).getReactNativeHost().getReactInstanceManager(), "FluidHelloWorld");

        dicesHost.addView(fluidReactRootView1);
    }

    protected ReactNativeHost getReactNativeHost() {
        return ((MainApplication) this.getApplication()).getReactNativeHost();
    }

    public boolean shouldShowDevMenuOrReload(int keyCode, KeyEvent event) {
        if (getReactNativeHost().hasInstance() && getReactNativeHost().getUseDeveloperSupport()) {
            if (keyCode == KeyEvent.KEYCODE_MENU) {
                getReactNativeHost().getReactInstanceManager().showDevOptionsDialog();
                return true;
            }
            boolean didDoubleTapR =
                    Assertions.assertNotNull(mDoubleTapReloadRecognizer)
                            .didDoubleTapR(keyCode, this.getCurrentFocus());
            if (didDoubleTapR) {
                getReactNativeHost().getReactInstanceManager().getDevSupportManager().handleReloadJS();
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        return shouldShowDevMenuOrReload(keyCode, event);
    }
}