// After `cap add/sync android`: install our launcher icons, keep the screen on, full-screen immersive, any orientation.
const fs = require('fs');
const path = require('path');

const res = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
const icons = path.resolve(__dirname, '..', 'assets', 'app', 'android');
// Use plain PNG launcher icons (drop Capacitor's default adaptive icon XML).
fs.rmSync(path.join(res, 'mipmap-anydpi-v26'), { recursive: true, force: true });
for (const dir of fs.readdirSync(icons)) {
  fs.mkdirSync(path.join(res, dir), { recursive: true });
  for (const f of fs.readdirSync(path.join(icons, dir))) fs.copyFileSync(path.join(icons, dir, f), path.join(res, dir, f));
}

const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
if (!manifest.includes('android:screenOrientation')) {
  manifest = manifest.replace('<activity', '<activity\n            android:screenOrientation="unspecified"');
}
fs.writeFileSync(manifestPath, manifest);

const activityDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'java', 'com', 'codegarden', 'yokaisurvivors');
fs.writeFileSync(path.join(activityDir, 'MainActivity.java'), `package com.codegarden.yokaisurvivors;

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }
}
`);
console.log('android project customised');
