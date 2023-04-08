import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import shallow from "zustand/shallow";
import { AddressInput } from "~~/components/scaffold-eth";
import { useHasHydrated } from "~~/hooks/next-zustand/useHasHydrated";
import { useAppStore } from "~~/services/store/store";
import { getMetadataObject } from "~~/utils/web3";

const Experiences = () => {
  const hasHydrated = useHasHydrated();
  const [mintRecipientAddress, setMintRecipientAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attributesForm, setAttributesForm] = useState<Record<string, any>>({});
  const { currentImgName, directoriesCids, userContracts, storeAttributes, storeMetadata, userImgObjs } = useAppStore(
    state => ({
      currentImgName: state.currentImgName,
      directoriesCids: state.directoriesCids,
      storeAttributes: state.storeAttributes,
      storeContract: state.storeContract,
      storeMetadata: state.storeMetadata,
      userContracts: state.userContracts,
      userImgObjs: state.userImgObjs,
    }),
    shallow,
  );
  useEffect(() => {
    if (hasHydrated) {
      console.log(userContracts);
      console.log(userImgObjs[0]);
      console.log(directoriesCids);
    }
    console.log("RENDER triggered");
  }, [directoriesCids, hasHydrated, userContracts, userImgObjs]);

  const onMintHandler = async (event: any, index: number) => {
    event.preventDefault();
    console.log(mintRecipientAddress);
    console.log(attributesForm);
    console.log(storeMetadata);
    // const fileMetadata = {
    //   type: "image/jpeg",
    // };
    // const file = new File([userImgObjs[index]], "image.jpg", fileMetadata);
    // const file = await getExampleImage(index);
    // console.log(file);

    const imgBlob = new Blob([userImgObjs[0]], { type: "image/jpeg" });
    console.log("Typeof imgBlob:", typeof imgBlob);
    console.log("imgBlob:", imgBlob);
    const metadata = getMetadataObject(storeMetadata[index], attributesForm);
    console.log(metadata);
    console.log(directoriesCids[index]);
    const body = {
      metadata: metadata,
      imgCid: directoriesCids[index],
      imgName: currentImgName,
    };

    // const formData = new FormData();
    // formData.append("files", imgBlob);
    // formData.append("imageCid", JSON.stringify({ imgCid: directoriesCids[index] }));
    // formData.append("imgName", JSON.stringify({ imgName: currentImgName }));
    // formData.append("metadata", JSON.stringify(metadata));
    // console.log(typeof JSON.stringify(metadata));
    try {
      const nftCid = await axios.post("/api/upload-metadata", body, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // const response = await axios.post(
      //   "/api/upload-metadata",
      //   {
      //     metadata: {
      //       name: storeMetadata[index].base_name_string_0,
      //       description: storeMetadata[index].description_string_1,
      //       image: imgBlob,
      //       attributesForm,
      //     },
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   },
      // );

      // const response = await axios.post("/api/upload-metadata", formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });
      console.log(nftCid);
    } catch (error: any) {
      if (error.body) {
        const parsedBody = JSON.parse(error.body);
        const { message } = parsedBody.error;
        toast.error(message, {
          position: "bottom-right",
        });
      } else {
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const contracts = userContracts.map((contractData: Record<string, any>, index: number) => (
    <div
      className="flex flex-col items-center justify-start h-full hover:border-orange-600 bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl px-6 py-4 md:py-8 xl:py-12"
      key={`${contractData.name}_0`}
    >
      <h5 className="mb-1 text-md font-medium text-left">Contract #{index}</h5>
      <h3 className="mb-4 text-xl font-medium text-center">{contractData.name || "Collection Name"}</h3>
      <h4 className="mb-1 text-lg font-medium text-left">Symbol: {contractData.symbol}</h4>
      <p className="text-md font-medium mb-4">Chain: {contractData.chain || "Ethereum"}</p>
      <div className="w-full flex items-center justify-center mb-4">
        <label
          htmlFor={`my-modal-${index}`}
          className="btn bg-orange-700 hover:bg-orange-600 border-primary-focus border-2 text-gray-900 dark:text-white btn-md md:btn-sm w-3/5 md:w-3/5 lg:w-2/5"
        >
          Mint <span className="ml-2">⛏️</span>
        </label>
        <input type="checkbox" id={`my-modal-${index}`} className="modal-toggle" />
        <div className="modal">
          <div className="modal-box relative">
            <label htmlFor={`my-modal-${index}`} className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </label>
            <h2 className="mt-12 mb-8 text-2xl font-medium text-center">Mint NFT and transfer to:</h2>
            <div className="mb-8 px-4">
              <AddressInput
                name="mintRecipientAddress"
                onChange={(value: any) => setMintRecipientAddress(value)}
                placeholder="Enter address or ENS"
                value={mintRecipientAddress}
              />
            </div>
            <div className="m-2">
              <h3 className="mb-2 text-xl font-medium text-center">NFT Attributes</h3>
              {storeAttributes[index].map((attribute: any) => (
                <div key={`${attribute}_${index}`} className="w-full">
                  <label className="ml-4 mb-4">{attribute}</label>
                  <div className="flex border-2 border-base-300 bg-base-200 rounded-lg text-accent">
                    <input
                      className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
                      placeholder=""
                      name={attribute}
                      value={attributesForm[attribute] || ""}
                      onChange={(event: any) =>
                        setAttributesForm(prevState => ({ ...prevState, [attribute]: event.target.value }))
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ))}
              <div className="w-full flex justify-center mt-8 mb-8">
                <button
                  className="btn bg-orange-700 hover:bg-orange-600 border-primary-focus border-2 text-gray-900 dark:text-white btn-md w-3/5 md:w-3/5 lg:w-2/5"
                  onClick={(event: any) => onMintHandler(event, index)}
                >
                  Mint <span className="ml-2">⛏️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-center mb-4">
        <button className="btn bg-secondary border-primary-focus border-2 text-gray-900 dark:text-white btn-md md:btn-sm w-3/5 md:w-3/5 lg:w-2/5">
          Analytics <span className="ml-2">📊</span>
        </button>
      </div>
      <Link
        className="hover:cursor-pointer hover:underline hover:underline-offset-2"
        href={`https://sepolia.etherscan.io/address/${contractData.address}`}
      >
        View on Explorer
      </Link>
      {/* <TemplateCard
        attributesArray={storeAttributes[index]}
        contractForm={storeContract[index]}
        isLoading={isLoading}
        metadataForm={storeMetadata[index]}
        onSubmitHandler={onDeployHandler}
        previewImage={currentImgName}
        storeIndex={index}
      /> */}
    </div>
  ));

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 lg:py-12 justify-center items-center min-h-full">
      <h1 className="text-4xl font-semibold text-center">Your Experiences</h1>
      {/* <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-xl w-full md:w-4/5 lg:w-3/5 xl:w-1/2 px-6 md:px-16 py-4 md:py-8"> */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-4 lg:gap-8 w-full lg:w-full px-2 md:px-16 lg:px-8 xl:px-24 py-4 lg:py-8 mt-8 mb-2 mx-0">
        {hasHydrated && contracts}
      </div>
    </div>
  );
};

export default Experiences;
