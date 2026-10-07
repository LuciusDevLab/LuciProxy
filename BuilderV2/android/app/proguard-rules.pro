# ProGuard rules for LuciProxy Manager Android
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep Kotlinx Serialization models
-keepclassmembers class * {
    *** Companion;
}
-keepclasseswithmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}

# Keep OkHttp & Security Crypto
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class androidx.security.crypto.** { *; }
