//package com.turvy.rider;
//
//import android.app.Application;
//import android.content.Context;
//import android.net.Uri;
//
////import com.reactlibrary.RNReactNativeOtpPackage;
//import com.facebook.react.PackageList;
//import com.facebook.react.ReactApplication;
////import com.hoxfon.react.RNTwilioVoice.TwilioVoicePackage;
////import com.dylanvann.fastimage.FastImageViewPackage;
////import com.dylanvann.fastimage.FastImageViewPackage;
////import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
////import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
////import com.ocetnik.timer.BackgroundTimerPackage;
////import com.bitgo.randombytes.RandomBytesPackage;
////import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;
////import com.henninghall.date_picker.DatePickerPackage;
////import com.react.otp.RNReactNativeOtpPackage;
////import me.furtado.smsretriever.RNSmsRetrieverPackage;
////import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;
//import com.facebook.react.ReactInstanceManager;
//import com.facebook.react.ReactNativeHost;
//import com.facebook.react.ReactPackage;
//import com.facebook.react.shell.MainReactPackage;
//import com.facebook.soloader.SoLoader;
//import com.turvy.rider.generated.BasePackageList;
//
//import java.lang.reflect.InvocationTargetException;
//import java.util.Arrays;
//import java.util.List;
//import javax.annotation.Nullable;
//
//public class MainApplication extends Application implements ReactApplication {
//  private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(
//    new BasePackageList().getPackageList()
//  );
//
//  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
//    @Override
//    public boolean getUseDeveloperSupport() {
//      return BuildConfig.DEBUG;
//    }
//
//    @Override
//    protected List<ReactPackage> getPackages() {
//      List<ReactPackage> packages = new PackageList(this).getPackages();
//      packages.add(new ModuleRegistryAdapter(mModuleRegistryProvider));
//      //packages.add(new ReactNativeFirebaseAppPackage());
//      return packages;
//    }
//
//    @Override
//    protected String getJSMainModuleName() {
//      return "index";
//    }
//
//    @Override
//    protected JSIModulePackage getJSIModulePackage() {
//      return new ReanimatedJSIModulePackage();
//    }
//
//    @Override
//    protected @Nullable String getJSBundleFile() {
//      if (BuildConfig.DEBUG) {
//        return super.getJSBundleFile();
//      } else {
//        return UpdatesController.getInstance().getLaunchAssetFile();
//      }
//    }
//
//    @Override
//    protected @Nullable String getBundleAssetName() {
//      if (BuildConfig.DEBUG) {
//        return super.getBundleAssetName();
//      } else {
//        return UpdatesController.getInstance().getBundleAssetName();
//      }
//    }
//  };
//
//  @Override
//  public ReactNativeHost getReactNativeHost() {
//    return mReactNativeHost;
//  }
//
//  @Override
//  public void onCreate() {
//    super.onCreate();
//    SoLoader.init(this, /* native exopackage */ false);
//
//    if (!BuildConfig.DEBUG) {
//      UpdatesController.initialize(this);
//    }
//
//    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
//  }
//
//  /**
//   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
//   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
//   *
//   * @param context
//   * @param reactInstanceManager
//   */
//  private static void initializeFlipper(
//      Context context, ReactInstanceManager reactInstanceManager) {
//    if (BuildConfig.DEBUG) {
//      try {
//        /*
//         We use reflection here to pick up the class that initializes Flipper,
//        since Flipper library is not available in release mode
//        */
//        Class<?> aClass = Class.forName("com.turvy.rider.ReactNativeFlipper");
//        aClass
//            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
//            .invoke(null, context, reactInstanceManager);
//      } catch (ClassNotFoundException e) {
//        e.printStackTrace();
//      } catch (NoSuchMethodException e) {
//        e.printStackTrace();
//      } catch (IllegalAccessException e) {
//        e.printStackTrace();
//      } catch (InvocationTargetException e) {
//        e.printStackTrace();
//      }
//    }
//  }
//}
