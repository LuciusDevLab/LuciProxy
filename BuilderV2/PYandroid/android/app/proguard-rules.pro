# ProGuard rules for LuciProxy PYandroid Manager
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep Kotlinx Serialization models
-keepclassmembers class * {
    *** Companion;
}
-keepclasseswithmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}

# Keep Security Crypto & Chaquopy
-keep class androidx.security.crypto.** { *; }
-keep class com.chaquo.python.** { *; }
