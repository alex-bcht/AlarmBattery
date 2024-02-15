package com.alarmbattery

import android.app.Activity
import android.content.Intent
import android.media.RingtoneManager
import android.net.Uri
import com.facebook.react.bridge.*
import android.media.MediaPlayer

class RingtonePickerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    private var mediaPlayer: MediaPlayer? = null
    private var promise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "RingtonePicker"
    }

    @ReactMethod
    fun pickRingtone(promise: Promise) {
        this.promise = promise
        val intent = Intent(RingtoneManager.ACTION_RINGTONE_PICKER).apply {
            putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_RINGTONE)
            putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, "Select Ringtone")
            putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, null as Uri?)
        }
        currentActivity?.startActivityForResult(intent, 999)
    }

    @ReactMethod
    fun playRingtoneFromUri(uriString: String) {
        // Stop and release any previous MediaPlayer instance
        mediaPlayer?.stop()
        mediaPlayer?.release()

        val uri: Uri = Uri.parse(uriString)
        mediaPlayer = MediaPlayer.create(reactApplicationContext, uri).apply {
            setOnCompletionListener {
                it.release()
            }
            start()
        }
    }

    @ReactMethod
    fun stopRingtone() {
        mediaPlayer?.stop()
        mediaPlayer?.release()
        mediaPlayer = null // Ensure the MediaPlayer is no longer used
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == 999 && resultCode == Activity.RESULT_OK) {
            val ringtoneUri: Uri? = data?.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI)
            if (ringtoneUri != null) {
                promise?.resolve(ringtoneUri.toString())
            } else {
                promise?.reject("NO_RINGTONE_SELECTED", "No ringtone was selected")
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // This method is required by the ActivityEventListener interface.
    }

    override fun onCatalystInstanceDestroy() {
        reactApplicationContext.removeActivityEventListener(this)
        super.onCatalystInstanceDestroy()
        mediaPlayer?.release()
    }
}
