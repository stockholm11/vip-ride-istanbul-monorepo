import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { sendContactMessage } from "../api/public/publicContactApi";

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      await sendContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

      setSubmitStatus({
        type: "success",
        message: t("contact.successMessage") || "Your message has been sent successfully. We will get back to you soon.",
      });
    } catch (error) {
      console.error("Error sending contact message:", error);
      setSubmitStatus({
        type: "error",
        message: t("contact.errorMessage") || "Failed to send message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-primary">
            {t("contact.title")}
          </h1>
          <p className="text-lg text-gray-600">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid gap-16 md:grid-cols-2">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-lg bg-white p-8 shadow-lg"
          >
            <h2 className="mb-6 text-2xl font-bold text-primary">
              {t("contact.title")}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {t("contact.name")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-secondary focus:outline-none text-base"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {t("contact.email")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-secondary focus:outline-none text-base"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {t("contact.phone")}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-secondary focus:outline-none text-base"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {t("contact.message")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-secondary focus:outline-none text-base"
                  required
                ></textarea>
              </div>
              {submitStatus.type && (
                <div
                  className={`mb-4 rounded-md p-4 ${
                    submitStatus.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}
              <button
                type="submit"
                className="btn-gold px-8 py-3 font-medium min-h-[44px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("contact.sending") || "Sending..." : t("contact.send")}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="mb-6 text-2xl font-bold text-primary">
                {t("footer.contactUs")}
              </h2>
              <div className="space-y-6">
                <div className="flex">
                  <MapPinIcon className="h-6 w-6 text-secondary mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {t("contact.address")}
                    </h3>
                    <p className="text-gray-600">
                      Etiler Mah. Nisbetiye Cd. Birlik Sk. <br />
                      No: 24 D:4 Beşiktaş, Istanbul / Turkey
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <PhoneIcon className="h-6 w-6 text-secondary mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {t("contact.phone")}
                    </h3>
                    <p className="text-gray-600">
                      <a href="tel:+905431568648">+90 543 156 8648</a>
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <EnvelopeIcon className="h-6 w-6 text-secondary mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {t("contact.email")}
                    </h3>
                    <p className="text-gray-600">
                      <a href="mailto:info@viprideistanbulairport.com">
                        info@viprideistanbulairport.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <ClockIcon className="h-6 w-6 text-secondary mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {t("contact.workingHours")}
                    </h3>
                    <p className="text-gray-600">{t("contact.mondayFriday")}</p>
                    <p className="text-gray-600">
                      {t("contact.saturdaySunday")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
