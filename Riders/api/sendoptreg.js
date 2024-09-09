
import { dummyPhone } from '../Constant'
import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import auth from '@react-native-firebase/auth';


export const sendoptreg = async (countryPick, mobileNumber, navigation, flref) => {
  // const phoneNumber = '+' + countryPick + '' + mobileNumber;
  const phoneNumber = '+12197797870';

  console.log('sendoptreg 1');

  if (mobileNumber == dummyPhone) {
    return navigation.replace('Verification', { phone: mobileNumber, countrycode: countryPick, fromwhere: 'registration', verificationId: '', code: '111111' });
  }

  console.log('sendoptreg 2', phoneNumber);

  try {
    const confirmation = await auth().verifyPhoneNumber(phoneNumber).on('state_changed', (phoneAuthSnapshot) => {

      console.log(phoneAuthSnapshot)
      switch (phoneAuthSnapshot.state) {
        // ------------------------
        //  IOS AND ANDROID EVENTS
        // ------------------------
        case firebase.auth.PhoneAuthState.CODE_SENT: // or 'sent'
          console.log('code sent');
          // setCodesent(true);
          console.log('State: ', phoneAuthSnapshot.state);
          const verificationIdr1 = phoneAuthSnapshot.verificationId;
          return navigation.replace('Verification', { phone: mobileNumber, countrycode: countryPick, fromwhere: 'registration', verificationId: verificationIdr1, code: '' });
          // on ios this is the final phone auth state event you'd receive
          // so you'd then ask for user input of the code and build a credential from it
          // as demonstrated in the `signInWithPhoneNumber` example above
          break;
        case firebase.auth.PhoneAuthState.ERROR: // or 'error'
          console.log('verification error');
          console.log(phoneAuthSnapshot.error);
          //setError(`Error: ${phoneAuthSnapshot.error}`);
          if (flref) {
            flref.current.showMessage({ message: "" + phoneAuthSnapshot.error, type: "danger", autoHide: false, });
          }

          break;

      }
      /* switch (phoneAuthSnapshot.state) {
   // ------------------------
   //  IOS AND ANDROID EVENTS
   // ------------------------
   case firebase.auth.PhoneAuthState.CODE_SENT: // or 'sent'
     console.log('code sent');
     setCodesent(true);
     // on ios this is the final phone auth state event you'd receive
     // so you'd then ask for user input of the code and build a credential from it
     // as demonstrated in the `signInWithPhoneNumber` example above
     break;
   case firebase.auth.PhoneAuthState.ERROR: // or 'error'
     console.log('verification error');
     console.log(phoneAuthSnapshot.error);
     break;

   // ---------------------
   // ANDROID ONLY EVENTS
   // ---------------------
   case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: // or 'timeout'
     console.log('auto verify on android timed out');
     // proceed with your manual code input flow, same as you would do in
     // CODE_SENT if you were on IOS
     const verificationIdr1 = phoneAuthSnapshot.verificationId;
     return navigation.replace('Verification',{phone:mobileNumber,countrycode:countryPick,fromwhere:'registration',verificationId:verificationIdr1,code:''});
     break;
   case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
     // auto verified means the code has also been automatically confirmed as correct/received
     // phoneAuthSnapshot.code will contain the auto verified sms code - no need to ask the user for input.
     console.log('auto verified on android');
     console.log(phoneAuthSnapshot);
     // Example usage if handling here and not in optionalCompleteCb:
      const { code } = phoneAuthSnapshot;
       const verificationIdr = phoneAuthSnapshot.verificationId;
      return navigation.replace('Verification',{phone:mobileNumber,countrycode:countryPick,fromwhere:'registration',verificationId:verificationIdr,code:code});
     // const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);

     // Do something with your new credential, e.g.:
     // firebase.auth().signInWithCredential(credential);
     // firebase.auth().currentUser.linkWithCredential(credential);
     // etc ...
     break;
 }
 */

    }, (error) => {
      // setCodesent(false);
      console.error(error);
    }, (phoneAuthSnapshot) => {
      console.log('Success');
    });
    /*if(verificationId){
       //return navigation.navigate('Verification',{phone:mobileNumber,countrycode:countryPick,fromwhere:'login',verificationId});
       return navigation.replace('Verification',{phone:mobileNumber,countrycode:countryPick,fromwhere:'registration',verificationId:verificationId});
    }
    */

  } catch (err) {
    console.log('sendoptreg error', err);
    //return navigation.replace('Login');
    flref.current.showMessage({ message: "" + err, type: "danger", autoHide: false, });
  }
}