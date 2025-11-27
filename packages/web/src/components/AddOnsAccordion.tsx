import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { getPublicAddOns, PublicAddOn } from "../api/public/publicAddOnsApi";

interface SelectedAddOn {
  addOnId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface AddOnsAccordionProps {
  selectedAddOns: SelectedAddOn[];
  onAddOnsChange: (addOns: SelectedAddOn[]) => void;
}

export default function AddOnsAccordion({
  selectedAddOns,
  onAddOnsChange,
}: AddOnsAccordionProps) {
  const { t } = useTranslation();
  const [addOns, setAddOns] = useState<PublicAddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const data = await getPublicAddOns();
        setAddOns(data);
      } catch (error) {
        console.error("Error fetching add-ons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddOns();
  }, []);


  const getQuantity = (addOnId: string): number => {
    const selected = selectedAddOns.find((a) => a.addOnId === addOnId);
    return selected?.quantity || 0;
  };

  const updateQuantity = (addOnId: string, delta: number) => {
    const addOn = addOns.find((a) => a.id === addOnId);
    if (!addOn) return;

    const currentQuantity = getQuantity(addOnId);
    const newQuantity = Math.max(0, currentQuantity + delta);

    const updatedAddOns = selectedAddOns.filter((a) => a.addOnId !== addOnId);

    if (newQuantity > 0) {
      updatedAddOns.push({
        addOnId: addOn.id,
        quantity: newQuantity,
        unitPrice: addOn.price,
        totalPrice: addOn.price * newQuantity,
      });
    }

    onAddOnsChange(updatedAddOns);
  };

  const totalAddOnsPrice = selectedAddOns.reduce((sum, addOn) => sum + addOn.totalPrice, 0);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-500">{t("addOns.loading", { defaultValue: "Yükleniyor..." })}</p>
      </div>
    );
  }

  if (addOns.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-lg"
              onClick={() => setIsOpen(!open)}
            >
              <span>{t("addOns.title", { defaultValue: "Ek Hizmetler" })}</span>
              <div className="flex items-center gap-2">
                {totalAddOnsPrice > 0 && (
                  <span className="text-primary font-semibold">
                    +€{totalAddOnsPrice.toFixed(2)}
                  </span>
                )}
                <ChevronDownIcon
                  className={`h-5 w-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pb-4 pt-2 text-sm text-gray-500">
              <div className="space-y-3">
                {addOns.map((addOn) => {
                  const quantity = getQuantity(addOn.id);

                  return (
                    <div
                      key={addOn.id}
                      className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{addOn.name}</h4>
                        {addOn.shortDescription && (
                          <p className="text-xs text-gray-500 mt-1">{addOn.shortDescription}</p>
                        )}
                        <p className="text-sm font-semibold text-primary mt-2">
                          €{addOn.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => updateQuantity(addOn.id, -1)}
                          disabled={quantity === 0}
                          className="p-1 rounded-full border border-gray-300 hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Azalt"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(addOn.id, 1)}
                          className="p-1 rounded-full border border-gray-300 hover:border-primary hover:bg-primary hover:text-white transition-colors"
                          aria-label="Artır"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}

