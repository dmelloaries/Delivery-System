import { Card, CardContent, CardFooter } from "@/components/ui/card";
import blackfriday from "../assets/black-friday.png";
import discount from "../assets/discount.png";
import check from "../assets/check.png";
import { SparklesText } from "@/components/ui/sparkles-text";

const OffersCard = () => {
  return (
    <div>
      <div>
        <div className="px-6 mt-4">
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
              <img
                src={discount}
                alt="Discount tag illustration"
                className="h-28 w-28 md:h-36 md:w-36 object-contain"
                loading="lazy"
              />

              <div className="flex-1 text-center md:text-left">
                <SparklesText className="block  text-purple-400 font-semibold">
                  ALL NEW <span className="text-purple-600">SHOPPING</span>{" "}
                  EXPERIENCE......
                </SparklesText>

                <SparklesText className="block text-2xl md:text-4xl font-extrabold text-purple-700 mt-1">
                  Lowest Prices Everyday
                </SparklesText>

                <p className="mt-2 text-sm text-purple-400">
                  Exclusive deals, fast delivery, and curated offers across all
                  categories.
                </p>
              </div>

              <img
                src={blackfriday}
                alt="Promotional sale illustration"
                className="h-28 w-28 md:h-36 md:w-36 object-contain"
                loading="lazy"
              />
            </CardContent>
            <span className="-mt-12"></span>

            <span className="flex justify-between px-4">
              <span className="flex">
                <img src={check} className="h-9 w-9 ml-4 " />
                <SparklesText
                  sparklesCount={0}
                  className="text-purple-600 text-xl"
                >
                  ₹0 handling Fees
                </SparklesText>

                <img src={check} className="h-9 w-9 ml-4 " />
                <SparklesText
                  sparklesCount={0}
                  className="text-purple-600 text-xl"
                >
                  ₹0 Delivery Fees
                </SparklesText>

                <img src={check} className="h-9 w-9 ml-4 " />
                <SparklesText
                  sparklesCount={0}
                  className="text-purple-600 text-xl"
                >
                  ₹0 Rain & Surge Fees
                </SparklesText>
              </span>

              <CardFooter className="flex justify-center md:justify-end p-4">
                <a
                  href="/login"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  aria-label="Shop now"
                >
                  Shop Now
                </a>
              </CardFooter>
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OffersCard;
