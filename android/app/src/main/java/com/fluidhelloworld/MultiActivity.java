package com.fluidhelloworld;

import androidx.appcompat.app.AppCompatActivity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
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
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.Toast;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactRootView;
import com.facebook.react.devsupport.DoubleTapReloadRecognizer;
import com.google.android.material.button.MaterialButton;

public class MultiActivity extends AppCompatActivity {

    private DoubleTapReloadRecognizer mDoubleTapReloadRecognizer;

    private ViewGroup mRnDicesHost = null;
    private ViewGroup mWebDicesHost = null;
    private ViewGroup mDashBoardHost =null;

    private ReactRootView createRNDicesView(boolean reuseInsance) {
        ReactRootView fluidReactRootView = new ReactRootView(this);

        ReactInstanceManager reactInstanceManager;
        if(reuseInsance)
            reactInstanceManager = ((MainApplication)getApplication()).getReactNativeHost().getReactInstanceManager();
        else
            reactInstanceManager = ((MainApplication)getApplication()).getReactNativeHost().createReactInstanceManager();

        fluidReactRootView.startReactApplication(reactInstanceManager, "FluidHelloWorld");
        fluidReactRootView.setLayoutParams(new LinearLayout.LayoutParams(500, 500));
        ((LinearLayout.LayoutParams)(fluidReactRootView.getLayoutParams())).setMargins(5,5,5,5);

        return fluidReactRootView;
    }

    private void addRNDice(boolean reuse) {
        mRnDicesHost.addView(createRNDicesView(reuse));
        Toast.makeText(this, "New RN dice added " + (reuse ? "reusing instance" : "using new instance"), Toast.LENGTH_SHORT).show();
    }

    public class MyWebChromeClient extends WebChromeClient {
        //Handle javascript alerts:
        @Override
        public boolean onJsAlert(WebView view, String url, String message, final android.webkit.JsResult result) {
            Log.d("alert", message);
            Toast.makeText(MultiActivity.this, message, Toast.LENGTH_LONG).show();
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

    private void configureWebView(WebView webView) {
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new MyWebChromeClient());

        WebSettings settings = webView.getSettings();

        // Mostly copied from other places to make the page work on Android. Some of the settings may be redundant.
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

        settings.setAllowContentAccess(true);
        settings.setAllowFileAccess(true);
        settings.setBlockNetworkImage(false);

        // Attempts to make the destop website fit to our dimensions, which hasn't worked so far.
        webView.getSettings().setUseWideViewPort(true);
        webView.getSettings().setLoadWithOverviewMode(true);
        webView.setInitialScale(10);
//                 webView.getSettings().setDefaultZoom(WebSettings.ZoomDensity.FAR);
        webView.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
//                webView.setLayoutParams(new LinearLayout.LayoutParams(500, 500));
    }

    private void addWebDice() {
        WebView webView = new WebView(MultiActivity.this);
        configureWebView(webView);
        webView.loadUrl("http://localhost:8080");
        // webView.loadUrl("http://127.0.0.1:8080");
        // webView.loadUrl("http://192.168.232.2:8080");

        FrameLayout webViewFrame = new FrameLayout(MultiActivity.this);
        webViewFrame.setLayoutParams(new FrameLayout.LayoutParams(500, 600));
        webViewFrame.addView(webView);
        mWebDicesHost.addView(webViewFrame);

        Toast.makeText(this, "New WebView dice added", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Needed for RN debug setup.
        mDoubleTapReloadRecognizer = new DoubleTapReloadRecognizer();

        setContentView(R.layout.activity_multi);

        mRnDicesHost = (ViewGroup) this.findViewById(R.id.rnDicesHostHost);
        mWebDicesHost = (ViewGroup) this.findViewById(R.id.webDicesHostHost);
        mDashBoardHost = (ViewGroup) this.findViewById(R.id.dashboardHost);

        this.registerReceiver(new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String mode = intent.getStringExtra("mode");
                switch (mode) {
                    case "RN_REUSE":
                        addRNDice(true);
                        break;
                    case "RN_NEW":
                        addRNDice(false);
                        break;
                    case "WEBVIEW":
                        addWebDice();
                        break;
                    default:
                        throw new UnsupportedOperationException("Unknown mode requested through the com.fluidhelloworld.NEW_DICE intent.");
                }
            }
        }, new IntentFilter("com.fluidhelloworld.NEW_DICE"));


        MaterialButton addRNViewReuseInstanceDiceButton = new MaterialButton(this);
        addRNViewReuseInstanceDiceButton.setText("RN (reuse)");
        addRNViewReuseInstanceDiceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                addRNDice(true);
            }
        });

        MaterialButton addRNViewNewInstanceDiceButton = new MaterialButton(this);
        addRNViewNewInstanceDiceButton.setText("RN (New)");
        addRNViewNewInstanceDiceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                addRNDice(false);
            }
        });

        MaterialButton addWebViewDiceButton = new MaterialButton(this);
        addWebViewDiceButton.setText("Web");
        addWebViewDiceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                addWebDice();
            }
        });

        mDashBoardHost.addView(addRNViewReuseInstanceDiceButton);
        mDashBoardHost.addView(addRNViewNewInstanceDiceButton);
        mDashBoardHost.addView(addWebViewDiceButton);

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