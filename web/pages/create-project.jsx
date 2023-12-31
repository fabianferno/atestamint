import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { useContractWrite, useContractEvent } from "wagmi";
import { parseEther } from "viem";
import { Success } from "@/components/alerts";
import { useAccount } from "wagmi";
import { ATESTAMINT_CONTRACT_ADDRESS, ATESTAMINT_ABI } from "utils/constants";
import { NFTStorage, File, Blob } from "nft.storage";

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);
const storage_client = new NFTStorage({
  token: process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || "",
});

export default function CreateProject() {
  useContractEvent({
    address: ATESTAMINT_CONTRACT_ADDRESS,
    abi: ATESTAMINT_ABI,
    eventName: "EditionCreated",
    listener(
      sender,
      editionAddress,
      vaultAddress,
      editionSize,
      imageURI,
      metadataContractURI
    ) {
      let log = {
        sender,
        editionAddress,
        vaultAddress,
        editionSize,
        imageURI,
        metadataContractURI,
      };
      let allCollections = JSON.parse(
        localStorage.getItem("allCollections") || "[]"
      );
      localStorage.setItem(
        "allCollections",
        JSON.stringify([...allCollections, log])
      );
      console.log("Log: ", log);
      console.log("allCollections: ", localStorage.getItem("allCollections"));
    },
  });

  const { address } = useAccount();
  const [milestoneData, setMilestoneData] = useState({
    milestoneTitle: "",
    milestoneDeadline: "",
    milestoneAttestationThreshold: "50",
    milestoneDescription: "",
  });
  const [milestoneSaving, setMilestoneSaving] = useState(false);
  const [createEditionParams, setCreateEditionParams] = useState({
    name: "",
    symbol: "",
    editionSize: 0,
    royaltyBPS: 0,
    publicSalePrice: 0.0001,
    maxSalePurchasePerAddress: 1,
    publicSaleStart: 0,
    publicSaleEnd: 0,
    presaleStart: 0,
    presaleEnd: 0,
    presaleMerkleRoot:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    description: "",
    imageURI: "",
    animationURI:
      "https://ipfs.io/ipfs/bafkreieb5wgfpxshncubgm232x4duop7cwwi7wr23rmsdxbq2mcjbczmti",
    metadataContractURI: "",
  });
  const [files, setFiles] = useState([]);

  const {
    data,
    error: prepareError,
    isError: isPrepareError,
    isLoading,
    isSuccess,
    write,
  } = useContractWrite({
    address: ATESTAMINT_CONTRACT_ADDRESS,
    abi: ATESTAMINT_ABI,
    functionName: "createEditionCollection",
  });

  const handleImageUpload = (files) => {
    const file = files[0].file;

    storage_client
      .storeBlob(file)
      .then((cid) => {
        console.log("NFT Storage Response:", cid);
        setCreateEditionParams({
          ...createEditionParams,
          imageURI: `https://ipfs.io/ipfs/${cid}`,
        });
      })
      .catch((err) => {
        console.log("Error from NftStorage:", err);
      });
  };

  const handleMilestoneData = (e) => {
    setMilestoneSaving(true);
    storage_client
      .storeBlob(new Blob([JSON.stringify(milestoneData)]))
      .then((cid) => {
        console.log("NFT Storage Response:", cid);
        setCreateEditionParams({
          ...createEditionParams,
          metadataContractURI: `https://ipfs.io/ipfs/${cid}`,
        });
        setMilestoneSaving(false);
      })
      .catch((err) => {
        console.log("Error from NftStorage:", err);
        setMilestoneSaving(false);
      });
  };

  const handleCreateEdition = () => {
    let a = createEditionParams;
    // let a = {
    //   name: "FAB tokens",
    //   symbol: "FABF",
    //   editionSize: "2",
    //   royaltyBPS: "100",
    //   publicSalePrice: 0.0001,
    //   maxSalePurchasePerAddress: "1",
    //   publicSaleStart: 1692057600,
    //   publicSaleEnd: 1693785600,
    //   presaleStart: 0,
    //   presaleEnd: 0,
    //   presaleMerkleRoot:
    //     "0x0000000000000000000000000000000000000000000000000000000000000000",
    //   description:
    //     "What is an NFT charity?\nWhat is NFT Fundraising? - The Giving Block\nNon-fungible tokens (a.k.a. “NFTs”) have become a global phenomenon and a growing force for good. Projects like the Bored Ape Yacht Club have reached mainstream culture, while NFT creators have given millions of dollars in crypto donations to charities",
    //   imageURI:
    //     "https://ipfs.io/ipfs/bafkreiakunz4c3y42szapm6kq7mldb4fuhum7kq2buibfwm3yrlh2p3ra4",
    //   animationURI:
    //     "https://ipfs.io/ipfs/bafkreiduenhjrl7hjgh3lwxr6nvmfv4kzqzzizhzkbydxdabtcjptavzbm",
    //   metadataContractURI:
    //     "https://ipfs.io/ipfs/bafkreie4iptsornypbyh44a7zppxyzfo6fg4aubesr73wkbsc75feuqx2a",
    // };
    console.log("Unformatted: ", a);

    let args = [
      [
        a.name,
        a.symbol,
        parseInt(a.editionSize),
        parseInt(a.royaltyBPS),
        [
          parseEther(a.publicSalePrice.toString()),
          parseInt(a.maxSalePurchasePerAddress),
          parseInt(a.publicSaleStart),
          parseInt(a.publicSaleEnd),
          parseInt(a.presaleStart),
          parseInt(a.presaleEnd),
          a.presaleMerkleRoot,
        ],
        a.description,
        a.animationURI,
        a.imageURI,
        a.metadataContractURI,
      ],
    ];
    console.log("Formatted: ", args);

    write({
      args,
      from: address,
    });
  };

  useEffect(() => {
    if (files.length > 0) {
      handleImageUpload(files);
    }
  }, [files]);

  return (
    <Layout pageTitle="Create Project">
      {/* Step 1 Panel Start */}
      <div className="mt-5 bg-white shadow sm:rounded-2xl overflow-hidden">
        <div className="px-5 py-3 text-white font-semibold text-xl bg-indigo-600">
          1. Add Your Milestones
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="mt-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Your Wallet Address
            </label>
            <div className="mt-2">
              <input
                type="email"
                name="email"
                id="email"
                defaultValue={address || "Connect Wallet"}
                disabled
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>

        {/* Form Start */}
        <div className="px-4 py-5 sm:p-6">
          <div className="flex -space-x-px rounded-md shadow-sm">
            <div className="relative grow rounded-md rounded-r-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-900"
              >
                Milestone Title <sup className="font-bold">*</sup>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={(e) =>
                  setMilestoneData({
                    ...milestoneData,
                    milestoneTitle: e.target.value,
                  })
                }
                className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="Plant 100 trees"
              />
            </div>
            <div className="relative grow px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
              <label
                htmlFor="job-title"
                className="block text-xs font-medium text-gray-900"
              >
                Attestation Deadline <sup className="font-bold">*</sup>
              </label>
              <input
                type="date"
                name="job-title"
                id="job-title"
                onChange={(e) =>
                  setMilestoneData({
                    ...milestoneData,
                    milestoneDeadline: e.target.value,
                  })
                }
                className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="Dec 3, 2023"
              />
            </div>
            <div className="relative grow rounded-md rounded-l-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
              <label
                htmlFor="job-title"
                className="block text-xs font-medium text-gray-900"
              >
                Attestation Required for Unlock{" "}
                <sup className="font-bold">*</sup>
              </label>
              <input
                disabled={true}
                type="text"
                name="job-title"
                id="job-title"
                className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="50% of Minted Supply"
              />
            </div>
          </div>
          <div className="mt-5">
            <label
              htmlFor="comment"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Milestone Description <sup className="font-bold">*</sup>
            </label>
            <div className="mt-2">
              <textarea
                rows={4}
                name="comment"
                id="comment"
                onChange={(e) =>
                  setMilestoneData({
                    ...milestoneData,
                    milestoneDescription: e.target.value,
                  })
                }
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                defaultValue={""}
                placeholder="Our organization will plant 100 evergreen trees in Nanaimo, British Columbia to help improve soil and water conservation, store carbon, moderate local climate, and give life to the world's wildlife."
              />
            </div>
          </div>

          <button
            type="button"
            className="mt-5 inline-flex items-center gap-x-2 rounded-md bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            <PlusCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Add Milestones
          </button>

          <div className="mt-3 relative flex items-start">
            <div className="text-sm leading-6">
              <label htmlFor="comments" className="font-medium text-gray-600">
                Only allow holders to attest.
              </label>
            </div>
            <div className="flex ml-3 h-6 items-center">
              <input
                id="comments"
                aria-describedby="comments-description"
                name="comments"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
            </div>
          </div>
          <label className="font-medium text-sm text-gray-600">
            Milestone URI: {createEditionParams.metadataContractURI}
          </label>

          <div className="mt-5 flex justify-end gap-x-3">
            <button
              onClick={handleMilestoneData}
              className="flex rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {milestoneSaving && (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 mr-2 border-white-500"></div>
                </div>
              )}
              Save Milestones
            </button>
            <button
              disabled={createEditionParams?.metadataContractURI == ""}
              onClick={() => {
                // Scroll page by 50%
                window.scrollBy({
                  top: window.innerHeight - 50,
                  left: 0,
                  behavior: "smooth",
                });
              }}
              className="disabled:opacity-50 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Next Step
            </button>
          </div>
        </div>
        {/* Form End */}
      </div>
      {/* Step 1 Panel End */}

      {/* New Step 2 Panel Start */}
      <div className="mt-5 bg-white shadow sm:rounded-2xl overflow-hidden">
        <div className="px-5 py-3 text-white font-semibold text-xl bg-indigo-600">
          2. Create Your NFT Collection
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-5 lg:gap-y-0 lg:gap-x-5">
            {/* Image upload column */}
            <div>
              <div className="mb-5">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Image URI
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Upload image or set custom Image URI"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={createEditionParams.imageURI}
                  />
                </div>
              </div>
              <FilePond
                files={files}
                onupdatefiles={setFiles}
                onaddfile={(file) => {
                  console.log(file);
                  storage_client
                    .storeBlob(new Blob([JSON.stringify(file)]))
                    .then((cid) => {
                      setCreateEditionParams({
                        ...createEditionParams,
                        imageURI: `https://ipfs.io/ipfs/${cid}`,
                      });
                    });
                }}
                allowMultiple={false}
                maxFiles={1}
                // server="/api"
                name="files" /* sets the file input name, it's filepond by default */
                labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
              />
            </div>
            {/* NFT Details Column */}
            <div>
              <div>
                <label
                  htmlFor="nftName"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Name
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => {
                      setCreateEditionParams({
                        ...createEditionParams,
                        name: e.target.value,
                      });
                      console.log(createEditionParams.name);
                    }}
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Colossal Shitcake"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="symbol"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Symbol
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => {
                      setCreateEditionParams({
                        ...createEditionParams,
                        symbol: e.target.value,
                      });
                      console.log(createEditionParams.symbol);
                    }}
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="RFIY"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="editionSize"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Edition Size
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => {
                      setCreateEditionParams({
                        ...createEditionParams,
                        editionSize: e.target.value,
                      });
                    }}
                    type="text"
                    name="editionSize"
                    id="editionSize"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="royaltyBPS"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Royalty BPS
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => {
                      setCreateEditionParams({
                        ...createEditionParams,
                        royaltyBPS: e.target.value,
                      });
                    }}
                    type="text"
                    name="royaltyBPS"
                    id="royaltyBPS"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="royaltyBPS"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    onChange={(e) => {
                      setCreateEditionParams({
                        ...createEditionParams,
                        description: e.target.value,
                      });
                    }}
                    rows={4}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    defaultValue={""}
                    placeholder="Our organization will plant 100 evergreen trees in Nanaimo, British Columbia to help improve soil and water conservation, store carbon, moderate local climate, and give life to the world's wildlife."
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="royaltyBPS"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Animation URI
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => {
                      setCreateEditionParams({
                        ...createEditionParams,
                        animationURI: e.target.value,
                      });
                    }}
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="https://ipfs.io/ipfs/bafkreieb5wgfpxshncubgm232x4duop7cwwi7wr23rmsdxbq2mcjbczmti"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="royaltyBPS"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Mint Start
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => {
                      let mintStartDate =
                        new Date(e.target.value).getTime() / 1000;
                      setCreateEditionParams({
                        ...createEditionParams,
                        publicSaleStart: mintStartDate,
                      });
                    }}
                    type="date"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    defaultValue={Date().now}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Mint Duration in Days
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => {
                      // Add number of days to the publicSaleStart
                      console.log(createEditionParams.publicSaleStart);
                      let mintStartDate = new Date(
                        createEditionParams.publicSaleStart * 1000
                      );
                      let mintEndDate = new Date(
                        mintStartDate.setDate(
                          mintStartDate.getDate() + parseInt(e.target.value)
                        )
                      );
                      console.log(mintEndDate);
                      setCreateEditionParams({
                        ...createEditionParams,
                        publicSaleEnd: mintEndDate.getTime() / 1000,
                      });
                    }}
                    type="number"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="In days"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="royaltyBPS"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Mint Limit per Address
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => {
                      setCreateEditionParams({
                        ...createEditionParams,
                        maxSalePurchasePerAddress: e.target.value,
                      });
                    }}
                    type="number"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="0 for unlimited *"
                  />
                </div>
              </div>

              <div className="mt-5">
                {isSuccess && <Success tx={data?.hash || ""} />}
                {isLoading && (
                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <InformationCircleIcon
                          className="h-5 w-5 text-blue-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3 flex-1 md:flex md:justify-between">
                        <p className="text-sm text-blue-700">
                          Pending Transaction
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-x-3">
            <button
              disabled={createEditionParams.imageURI === ""}
              onClick={handleCreateEdition}
              className="disabled:opacity-50 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-black"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
      {/* New Step 2 Panel End */}
    </Layout>
  );
}
