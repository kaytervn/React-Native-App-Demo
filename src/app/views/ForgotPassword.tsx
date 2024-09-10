import Intro from "@/src/components/Intro";
import InputField from "@/src/components/InputField";
import useForm from "../hooks/useForm";
import { MailIcon } from "lucide-react-native";
import Button from "@/src/components/Button";

const ForgotPassword = ({ navigation }: any) => {
  const validate = (form: any) => {
    const newErrors: any = {};
    if (!form.email.trim()) {
      newErrors.email = "Email không được bỏ trống";
    }
    return newErrors;
  };
  const { form, errors, handleChange, isValidForm } = useForm(
    { email: "" },
    { email: "" },
    validate
  );
  const handleSubmit = () => {
    if (isValidForm()) {
      navigation.navigate("ResetPassword", { email: form.email });
    }
  };
  return (
    <Intro
      color="royalblue"
      header="Quên mật khẩu?"
      subHeader="Nhập địa chỉ email để lấy lại mật khẩu"
    >
      <InputField
        title="Địa chỉ email"
        isRequire={true}
        placeholder="Nhập địa chỉ email"
        onChangeText={(value: any) => handleChange("email", value)}
        keyboardType="email-address"
        value={form.email}
        icon={MailIcon}
        error={errors.email}
      />
      <Button title="TIẾP TỤC" color="royalblue" onPress={handleSubmit} />
    </Intro>
  );
};

export default ForgotPassword;
