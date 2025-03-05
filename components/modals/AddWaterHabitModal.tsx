import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";

//components
import InputField from "@/components/cards/InputField";
import InputPicker from "@/components/cards/InputPicker";
import { CustomText } from "@/CustomText";
import CustomButton from "@/components/CustomButton";

//icons
import MugIcon from "@/components/icons/MugIcon";
import EmptyGlassIcon from "../icons/EmptyGlassIcon";
import BottleIcon from "../icons/BottleIcon";
import CupIcon from "../icons/CupIcon";
import CloseIcon from "../icons/CloseIcon";

// firebase
import { db, auth } from "@/firebase.config";
import { doc, setDoc } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";

// language
import { useLanguage } from "@/app/LanguageContext";
// show message
import { showMessage } from "react-native-flash-message";

const { width } = Dimensions.get("window");

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  onSave?: (waterData: {
    dailyWaterIntake: number;
    dailyCupsNeeded: number;
    dailyCupSize: number;
    weigth: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    climate: string;
    activityTime: string;
    healthCondition: string;
    dietType: string;
    sleepHours: string;
  }) => void;
};

export default function AddWaterHabitModal({
  visible,
  onClose,
  onSave,
}: Props) {
  // language context
  const { t } = useLanguage();

  // cup sizes
  const cupSizes = [
    {
      size: 200,
      component: (
        <EmptyGlassIcon
          width={width > 768 ? 31 : 21}
          height={width > 768 ? 30 : 30}
        />
      ),
      name: t("waterCupName.typeGlass"),
    },
    {
      size: 250,
      component: (
        <CupIcon
          width={width > 768 ? 31 : 21}
          height={width > 768 ? 30 : 30}
          variant="empty"
        />
      ),
      name: t("waterCupName.typeCup"),
    },
    {
      size: 300,
      component: (
        <MugIcon
          width={width > 768 ? 31 : 21}
          height={width > 768 ? 30 : 30}
          variant="empty"
        />
      ),
      name: t("waterCupName.typeMug"),
    },
    {
      size: 500,
      component: (
        <BottleIcon
          width={width > 768 ? 51 : 41}
          height={width > 768 ? 50 : 40}
          variant="empty"
          litres={500}
          position="vertical"
        />
      ),
      name: t("waterCupName.typeSmallBottle"),
    },
    {
      size: 1000,
      component: (
        <BottleIcon
          width={width > 768 ? 51 : 41}
          height={width > 768 ? 50 : 40}
          variant="empty"
          litres={1000}
          position="vertical"
        />
      ),
      name: t("waterCupName.typeLargeBottle"),
    },
    {
      size: 1500,
      component: (
        <BottleIcon
          width={width > 768 ? 61 : 51}
          height={width > 768 ? 60 : 50}
          variant="empty"
          litres={1500}
          position="vertical"
        />
      ),
      name: t("waterCupName.typeExtraLargeBottle"),
    },
  ];

  // current user
  const userId = auth.currentUser?.uid;

  const [step, setStep] = useState<number>(1);
  const [calculatedIntake, setCalculatedIntake] = useState<number>(0);
  const [selectedCupSize, setSelectedCupSize] = useState<number>(0);
  const [cupsNeeded, setCupsNeeded] = useState<number>(0);
  const [cupType, setCupType] = useState<string>("");

  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "Male",
    activityLevel: "Moderate",
    climate: "Moderate",
    activityTime: "20",
    healthCondition: "Normal",
    dietType: "Regular",
    sleepHours: "8",
    dailyWaterIntake: 0,
    dailyCupSize: 0,
    dailyCupsNeeded: 0,
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateInputs = (): boolean => {
    const { weight, height, age } = formData;

    if (!weight || !height || !age) {
      Alert.alert("Error", "Please fill in all required fields.");
      return false;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseFloat(age);

    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 300) {
      Alert.alert("Error", "Please enter a valid weight (0-300 kg).");
      return false;
    }

    if (isNaN(heightNum) || heightNum <= 0 || heightNum > 250) {
      Alert.alert("Error", "Please enter a valid height (0-250 cm).");
      return false;
    }

    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      Alert.alert("Error", "Please enter a valid age (0-120 years).");
      return false;
    }

    return true;
  };

  const calculateWaterIntake = useCallback(() => {
    if (!validateInputs()) {
      showMessage({
        message: t("alerts.alertFillTheFields"),
        type: "danger",
      });
      return;
    }

    const {
      weight,
      height,
      age,
      gender,
      activityLevel,
      climate,
      activityTime,
      healthCondition,
      dietType,
      sleepHours,
    } = formData;

    // convert string values to numbers
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseFloat(age);
    const activityTimeNum = parseInt(activityTime, 10);
    const sleepHoursNum = parseInt(sleepHours, 10);

    // base calculation using weight (30ml per kg)
    let waterIntake = weightNum * 30;

    // adjust for height (taller people need more water)
    const heightFactor = heightNum / 170; // 170cm as baseline
    waterIntake *= heightFactor;

    // activity level adjustments
    const activityMultipliers = {
      Sedentary: 0.7,
      Light: 0.9,
      Moderate: 1.0,
      High: 1.2,
      Intense: 1.4,
    };
    waterIntake *=
      activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    // climate adjustments
    const climateMultipliers = {
      Cold: 0.9,
      Moderate: 1.0,
      Hot: 1.2,
      VeryHot: 1.4,
    };
    waterIntake *=
      climateMultipliers[climate as keyof typeof climateMultipliers];

    // additional activity time (10ml per minute of exercise)
    waterIntake += activityTimeNum * 10;

    // age adjustment (older people need more reminders to drink)
    if (ageNum > 60) waterIntake *= 1.1;

    // gender adjustment
    if (gender === "Male") waterIntake *= 1.1;

    // health condition adjustments
    const healthMultipliers = {
      Normal: 1.0,
      Pregnant: 1.3,
      Breastfeeding: 1.4,
      Athletic: 1.2,
      HighBloodPressure: 1.1,
      KidneyIssues: 0.8,
    };
    waterIntake *=
      healthMultipliers[healthCondition as keyof typeof healthMultipliers];

    // diet type adjustments
    const dietMultipliers = {
      Regular: 1.0,
      HighProtein: 1.2,
      HighSalt: 1.1,
      Vegetarian: 0.9,
      Keto: 1.2,
    };
    waterIntake *= dietMultipliers[dietType as keyof typeof dietMultipliers];

    // sleep adjustment (less sleep = more water needed)
    const sleepFactor = 8 / sleepHoursNum;
    waterIntake *= sleepFactor;

    // convert to liters
    const waterIntakeLiters = waterIntake / 1000;

    setCalculatedIntake(waterIntakeLiters);
    setStep(6);
  }, [formData]);

  const handleCupSelection = useCallback(
    (cupSize: number, name: string) => {
      setTimeout(() => {
        setSelectedCupSize(cupSize); // set the choosen cup size
        setCupType(name);
        setCupsNeeded(Math.ceil((calculatedIntake * 1000) / cupSize));
        // const cupsNeeded = Math.ceil((calculatedIntake * 1000) / cupSize); // calculate the number of cups

        const waterData = {
          weight: formData.weight,
          height: formData.height,
          age: formData.age,
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          climate: formData.climate,
          activityTime: formData.activityTime,
          healthCondition: formData.healthCondition,
          dietType: formData.dietType,
          sleepHours: formData.sleepHours,
          dailyWaterIntake: calculatedIntake,
          dailyCupsNeeded: cupsNeeded,
          dailyCupSize: cupSize,
          cupType: name,
        };

        if (onSave) {
          onSave(waterData); // save the data
        }

        setStep(7); // next step
      }, 3000); // wait 3 seconds
    },
    [calculatedIntake, onSave]
  );

  const handleSendDataToDb = useCallback(async () => {
    try {
      if (!userId) {
        console.log("user did not find");
        return;
      }

      // user doc referance
      const userDocRef = doc(db, "users", userId);
      const habitsDocRef = collection(userDocRef, "habits");

      // data to save to db
      const waterData = {
        dailyWaterIntake: calculatedIntake,
        cupsNeeded: cupsNeeded || 0,
        cupSize: selectedCupSize,
        weigth: formData.weight,
        height: formData.height,
        age: formData.age,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        climate: formData.climate,
        activityTime: formData.activityTime,
        healthCondition: formData.healthCondition,
        dietType: formData.dietType,
        sleepHours: formData.sleepHours,
        cupType: cupType,
      };

      const habitsData = {
        variant: "Water",
        streakDays: 0,
        dailyWaterIntake: calculatedIntake,
        cupsNeeded: cupsNeeded || 0,
        cupSize: selectedCupSize,
        cupType: cupType,
        isDone: false,
        createdAt: new Date(),
        finishedAt: null,
        isArhived: false,
        lastChangeAt: new Date().toISOString().split("T")[0],
      };

      await setDoc(userDocRef, waterData, { merge: true });
      await addDoc(habitsDocRef, habitsData);

      console.log("data saved to db successfully");
      if (onSave) {
        onSave(waterData);
      }
      onClose();
    } catch (error) {
      console.log("error saving data to db", error);
    }
  }, [userId, calculatedIntake, onSave, cupsNeeded, selectedCupSize]);

  const renderInputForm = () => {
    const renderStepContent = () => {
      switch (step) {
        case 1:
          return (
            <View style={styles.inputContainer}>
              <CustomText
                style={styles.modalSubTitle}
                type="regular"
                color="#1E3A5F"
                fontSize={16}
              >
                {step} / 5
              </CustomText>
              <View style={styles.formItem}>
                <InputField
                  label={t("waterHabitModal.weight")}
                  placeholder={t("waterHabitModal.weightPlaceholder")}
                  keyboardType="numeric"
                  value={formData.weight}
                  onChangeText={(value) => handleInputChange("weight", value)}
                />
              </View>
              <View style={styles.formItem}>
                <InputField
                  label={t("waterHabitModal.height")}
                  placeholder={t("waterHabitModal.heightPlaceholder")}
                  keyboardType="numeric"
                  value={formData.height}
                  onChangeText={(value) => handleInputChange("height", value)}
                />
              </View>
            </View>
          );
        case 2:
          return (
            <View style={styles.inputContainer}>
              <CustomText
                style={styles.modalSubTitle}
                type="regular"
                color="#1E3A5F"
                fontSize={16}
              >
                {step} / 5
              </CustomText>
              <View style={styles.formItem}>
                <InputField
                  label={t("waterHabitModal.age")}
                  placeholder={t("waterHabitModal.agePlaceholder")}
                  keyboardType="numeric"
                  value={formData.age}
                  onChangeText={(value) => handleInputChange("age", value)}
                />
              </View>
              <View style={styles.formItem}>
                <InputPicker
                  label={t("waterHabitModal.gender")}
                  selectedValue={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  items={[
                    { label: t("waterHabitModal.genderMale"), value: "Male" },
                    {
                      label: t("waterHabitModal.genderFemale"),
                      value: "Female",
                    },
                  ]}
                />
              </View>
            </View>
          );
        case 3:
          return (
            <View style={styles.inputContainer}>
              <CustomText
                style={styles.modalSubTitle}
                type="regular"
                color="#1E3A5F"
                fontSize={16}
              >
                {step} / 5
              </CustomText>
              <View style={styles.formItem}>
                <InputPicker
                  label={t("waterHabitModal.activityLevel")}
                  selectedValue={formData.activityLevel}
                  onValueChange={(value) =>
                    handleInputChange("activityLevel", value)
                  }
                  items={[
                    {
                      label: t("waterHabitModal.activitySedentary"),
                      value: "Sedentary",
                    },
                    {
                      label: t("waterHabitModal.activityLight"),
                      value: "Light",
                    },
                    {
                      label: t("waterHabitModal.activityModerate"),
                      value: "Moderate",
                    },
                    {
                      label: t("waterHabitModal.activityActive"),
                      value: "High",
                    },
                    {
                      label: t("waterHabitModal.activityIntense"),
                      value: "Intense",
                    },
                  ]}
                />
              </View>
              <View style={styles.formItem}>
                <InputPicker
                  label={t("waterHabitModal.climate")}
                  selectedValue={formData.climate}
                  onValueChange={(value) => handleInputChange("climate", value)}
                  items={[
                    { label: t("waterHabitModal.climateCold"), value: "Cold" },
                    {
                      label: t("waterHabitModal.climateWarm"),
                      value: "Moderate",
                    },
                    { label: t("waterHabitModal.climateHot"), value: "Hot" },
                    {
                      label: t("waterHabitModal.climateVeryHot"),
                      value: "VeryHot",
                    },
                  ]}
                />
              </View>
            </View>
          );
        case 4:
          return (
            <View style={styles.inputContainer}>
              <CustomText
                style={styles.modalSubTitle}
                type="regular"
                color="#1E3A5F"
                fontSize={16}
              >
                {step} / 5
              </CustomText>
              <View style={styles.formItem}>
                <InputField
                  label={t("waterHabitModal.activityTime")}
                  placeholder={t("waterHabitModal.activityTimePlaceholder")}
                  keyboardType="numeric"
                  value={formData.activityTime}
                  onChangeText={(value) =>
                    handleInputChange("activityTime", value)
                  }
                />
              </View>
              <View style={styles.formItem}>
                <InputPicker
                  label={t("waterHabitModal.healthCondition")}
                  selectedValue={formData.healthCondition}
                  onValueChange={(value) =>
                    handleInputChange("healthCondition", value)
                  }
                  items={[
                    {
                      label: t("waterHabitModal.healthNormal"),
                      value: "Normal",
                    },
                    {
                      label: t("waterHabitModal.healthPregnant"),
                      value: "Pregnant",
                    },
                    {
                      label: t("waterHabitModal.healthBreast"),
                      value: "Breastfeeding",
                    },
                    {
                      label: t("waterHabitModal.healthAthletic"),
                      value: "Athletic",
                    },
                    {
                      label: t("waterHabitModal.healthHighBloodPressure"),
                      value: "HighBloodPressure",
                    },
                    {
                      label: t("waterHabitModal.healthKidneyIssues"),
                      value: "KidneyIssues",
                    },
                  ]}
                />
              </View>
            </View>
          );
        case 5:
          return (
            <View style={styles.inputContainer}>
              <CustomText
                style={styles.modalSubTitle}
                type="regular"
                color="#1E3A5F"
                fontSize={16}
              >
                {step} / 5
              </CustomText>
              <View style={styles.formItem}>
                <InputPicker
                  label={t("waterHabitModal.dietType")}
                  selectedValue={formData.dietType}
                  onValueChange={(value) =>
                    handleInputChange("dietType", value)
                  }
                  items={[
                    {
                      label: t("waterHabitModal.dietRegular"),
                      value: "Regular",
                    },
                    {
                      label: t("waterHabitModal.dietHighProtein"),
                      value: "HighProtein",
                    },
                    {
                      label: t("waterHabitModal.dietHighSalt"),
                      value: "HighSalt",
                    },
                    {
                      label: t("waterHabitModal.dietVegetarian"),
                      value: "Vegetarian",
                    },
                    { label: t("waterHabitModal.dietKeto"), value: "Keto" },
                  ]}
                />
              </View>
              <View style={styles.formItem}>
                <InputField
                  label={t("waterHabitModal.sleepHours")}
                  placeholder={t("waterHabitModal.sleepHoursPlaceholder")}
                  keyboardType="numeric"
                  value={formData.sleepHours}
                  onChangeText={(value) =>
                    handleInputChange("sleepHours", value)
                  }
                />
              </View>
            </View>
          );
        default:
          return null;
      }
    };

    return (
      <>
        {renderStepContent()}
        <View style={styles.buttonContainer}>
          {step > 1 && (
            <CustomButton
              label={t("waterHabitModal.backButtonText")}
              onPress={() => setStep(step - 1)}
              width="40%"
              height={50}
              variant="cancel"
            />
          )}
          {step < 5 ? (
            <CustomButton
              label={t("waterHabitModal.nextButtonText")}
              onPress={() => setStep(step + 1)}
              width="40%"
              height={50}
              variant="fill"
              marginLeft={10}
            />
          ) : (
            <CustomButton
              label={t("waterHabitModal.calculateButtonText")}
              onPress={calculateWaterIntake}
              width="40%"
              height={50}
              variant="fill"
              marginLeft={10}
            />
          )}
        </View>
      </>
    );
  };

  const renderCupSelection = () => (
    <>
      <CustomText
        style={styles.modalSubTitle}
        type="medium"
        color="#1E3A5F"
        fontSize={14}
      >
        {t("waterHabitModal.selectCupTitle")}
      </CustomText>
      <View style={styles.resultContainer}>
        <CustomText
          style={styles.resultText}
          type="semibold"
          fontSize={16}
          color="#1E3A5F"
        >
          {t("waterHabitModal.dailyWaterIntake")}:{" "}
          <CustomText style={styles.resultBold}>
            {calculatedIntake.toFixed(1)} {t("waterHabitModal.liter")}
          </CustomText>
        </CustomText>
      </View>
      <View style={styles.cupGrid}>
        {cupSizes.map(({ size, component, name }) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.cupButton,
              selectedCupSize === size && styles.selectedCup,
            ]}
            onPress={() => handleCupSelection(size, name)}
          >
            {component}
            <View style={styles.cupNameContainer}>
              <CustomText style={styles.cupName}>{name}</CustomText>
              <CustomText style={styles.cupSize}>{size} ml</CustomText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderResult = () => (
    <>
      <CustomText
        style={{ marginBottom: 40 }}
        type="bold"
        color="#1E3A5F"
        fontSize={20}
      >
        {t("waterHabitModal.dailyWaterGoal")}
      </CustomText>
      <View style={styles.resultContainer}>
        <CustomText
          style={styles.resultText}
          type="medium"
          color="#1E3A5F"
          fontSize={14}
        >
          {t("waterHabitModal.dailyWaterIntake")}:{" "}
          <CustomText style={styles.resultBold}>
            {calculatedIntake.toFixed(1)} {t("waterHabitModal.liter")}
          </CustomText>
        </CustomText>
      </View>
      <View style={styles.resultContainer}>
        <CustomText
          style={styles.resultText}
          type="medium"
          color="#1E3A5F"
          fontSize={14}
        >
          {t("waterHabitModal.numberOfCups")}:{" "}
          <CustomText style={styles.resultBold}>
            {Math.ceil((calculatedIntake * 1000) / selectedCupSize)}
          </CustomText>
        </CustomText>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          label={t("waterHabitModal.doneButtonText")}
          onPress={handleSendDataToDb}
          width="40%"
          height={50}
          variant="fill"
        />
      </View>
    </>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <CloseIcon size={24} color="#1E3A5F" />
          </TouchableOpacity>
          {step <= 5 && (
            <CustomText
              style={styles.modalTitle}
              type="bold"
              fontSize={20}
              color="#1E3A5F"
            >
              {t("waterHabitModal.title")}
            </CustomText>
          )}
          <View style={styles.modalContent}>
            {step <= 5 && renderInputForm()}
            {step === 6 && renderCupSelection()}
            {step === 7 && renderResult()}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "100%",
    maxWidth: 370,
    maxHeight: "90%",
    backgroundColor: "#FCFCFC",
    paddingHorizontal: 30,
    paddingVertical: 30,
    paddingTop: 60,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  modalContent: {
    width: "100%",
    alignItems: "center",
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  modalSubTitle: {
    opacity: 0.8,
    marginBottom: 30,
    textAlign: "center",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 30,
    width: "100%",
    alignItems: "center",
  },
  formItem: {
    width: "100%",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
  },
  resultContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  cupGrid: {
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
    gap: 10,
    padding: 4,
    marginTop: 10,
    // backgroundColor: "yellow",
  },
  cupButton: {
    width: "31%",
    height: 120,
    backgroundColor: "#E5EEFF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  selectedCup: {
    backgroundColor: "#FFA38F",
  },
  cupNameContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  cupName: {
    fontSize: Platform.OS === "web" ? 12 : 12 * 0.8,
    color: "#1E3A5F",
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  cupSize: {
    fontSize: 12,
    color: "#1E3A5F",
    opacity: 0.7,
    fontWeight: "400",
    marginTop: 6,
  },
  resultText: {
    fontSize: width > 768 ? 16 : 14,
    color: "#1E3A5F",
    // opacity: 0.8,
    textAlign: "center",
  },
  resultBold: {
    fontWeight: "bold",
    fontSize: width > 760 ? 18 : 16,
    marginLeft: 10,
    color: "#1E3A5F",
    backgroundColor: "#E5EEFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});
