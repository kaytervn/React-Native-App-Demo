import InputField from "@/src/components/InputField";
import {
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
  CircleUserRoundIcon,
} from "lucide-react-native";
import Button from "@/src/components/Button";
import { EmailPattern } from "@/src/types/constant";
import Intro from "@/src/components/Intro";
import useForm from "../hooks/useForm";
import Toast from "react-native-toast-message";
import { successToast } from "@/src/types/toast";

const Register = ({ navigation }: any) => {
  const validate = (form: any) => {
    const newErrors: any = {};
    if (!form.displayName.trim()) {
      newErrors.displayName = "Tên hiển thị không được bỏ trống";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email không được bỏ trống";
    } else if (!EmailPattern.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!form.password) {
      newErrors.password = "Mật khẩu không được bỏ trống";
    } else if (form.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không được bỏ trống";
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
    }
    return newErrors;
  };

  const { form, errors, handleChange, isValidForm } = useForm(
    {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate
  );

  const handleSubmit = () => {
    if (isValidForm()) {
      Toast.show(successToast("Đăng ký tài khoản thành công"));
      navigation.navigate("Login");
    }
  };

  return (
    <Intro
      color="royalblue"
      header="Tạo tài khoản"
      subHeader="Mừng thành viên mới!"
    >
      <InputField
        title="Tên hiển thị"
        isRequire={true}
        placeholder="Nhập tên hiển thị"
        onChangeText={(value: any) => handleChange("displayName", value)}
        value={form.displayName}
        icon={CircleUserRoundIcon}
        error={errors.displayName}
      />
      <InputField
        title="Email đăng ký"
        isRequire={true}
        placeholder="Nhập địa chỉ email"
        onChangeText={(value: any) => handleChange("email", value)}
        keyboardType="email-address"
        value={form.email}
        icon={MailIcon}
        error={errors.email}
      />
      <InputField
        title="Mật khẩu"
        isRequire={true}
        placeholder="Nhập mật khẩu"
        onChangeText={(value: any) => handleChange("password", value)}
        value={form.password}
        icon={LockIcon}
        secureTextEntry={true}
        error={errors.password}
      />
      <InputField
        title="Xác nhận mật khẩu"
        isRequire={true}
        placeholder="Nhập mật khẩu xác nhận"
        onChangeText={(value: any) => handleChange("confirmPassword", value)}
        value={form.confirmPassword}
        icon={ShieldCheckIcon}
        secureTextEntry={true}
        error={errors.confirmPassword}
      />
      <Button title="ĐĂNG KÝ" color="royalblue" onPress={handleSubmit} />
    </Intro>
  );
};

export default Register;
