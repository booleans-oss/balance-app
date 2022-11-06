import autoAnimate from "@formkit/auto-animate";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { clsx } from "clsx";
import { format } from "date-fns";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { AiFillCalendar } from "react-icons/ai";
import { BiLinkExternal } from "react-icons/bi";
import { IoMdAdd, IoMdArrowBack, IoMdTrash } from "react-icons/io";
import { MdBookmark } from "react-icons/md";
import classes from "../data/classes.json";
import type {
  Recording,
  RecordingType,
  Transaction,
  TransactionType
} from "../types";
import { RecordingColors } from "../types";
import { trpc } from "../utils/trpc";

const allClasses = classes;
const categorizedClasses = Object.entries(classes).reduce(
  (acc, [key, value]) => {
    if (acc[key[0] as string]) {
      acc[key[0] as string]?.push({ value, key });
    } else {
      acc[key[0] as string] = [{ value, key }];
    }
    return acc;
  },
  {} as Record<string, Array<{ value: string; key: string }>>
);

const columnHelper = createColumnHelper<Recording>();

export default function CreatePage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [steps, setSteps] = React.useState<[boolean, boolean]>([false, false]);
  const [generalInfo, setGeneralInfo] = React.useState({
    name: "",
    description: "",
    purpose: "",
  });
  const [recordings, setRecordings] = React.useState<Recording[]>([]);
  const [isChecked, setIsChecked] = React.useState(false);
  const [recordingError, setRecordingError] = React.useState(false);

  const columns = [
    columnHelper.accessor((row) => row.date, {
      id: "date",
      cell: (info) => <i>{format(info.getValue(), "dd/MM/yyyy")}</i>,
      header: () => <span>Date</span>,
    }),
    columnHelper.accessor("type", {
      header: () => "Type",
      cell: (info) => (
        <span
          className={clsx(
            "rounded-md border border-border-primary px-2 text-sm font-semibold uppercase",
            RecordingColors[info.renderValue() ?? "INVOICE"]
          )}
        >
          {info.renderValue()}
        </span>
      ),
    }),
    columnHelper.accessor("transactions", {
      id: "amounts",
      header: () => "Amount",
      cell: (info) => (
        <span key={info.row.id}>
          {Math.max(
            ...(info.row.original.transactions.map(
              (transaction) => transaction.amount
            ) ?? [])
          )}
        </span>
      ),
    }),
    columnHelper.display({
      id: "accounts",
      header: "Accounts",
      cell: (props) =>
        props.row.original.transactions.map((transaction, index) => (
          <div
            key={index}
            className="group relative mx-1 inline-block w-fit cursor-pointer border-b border-gray-400 text-center"
          >
            {transaction.accountNumber}
            <div className="pointer-events-none absolute bottom-full -left-1/2 z-10 w-fit rounded-lg bg-black py-2 px-3 text-center text-xs text-white opacity-0 group-hover:opacity-100">
              {allClasses[transaction.accountNumber as keyof typeof allClasses]}
            </div>
          </div>
        )),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (props) => (
        <IoMdTrash
          onClick={() => {
            setRecordings(recordings.filter((_, i) => i !== props.row.index));
          }}
          className="h-5 w-5 cursor-pointer text-white"
        />
      ),
    }),
  ];

  const table = useReactTable({
    data: recordings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const parent = useRef(null);

  const { isLoading, mutateAsync } = trpc.balance.create.useMutation();

  const router = useRouter();

  const handleSubmit = async () => {
    const data = await mutateAsync({
      generalInfo,
      recordings,
    });

    router.push(`/balance/${data.id}`);
  };

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const checkRecordings = () => {
    const debitRecordings = recordings.flatMap((recording) =>
      recording.transactions.filter(
        (transaction) => transaction.type === "DEBIT"
      )
    );
    const creditRecordings = recordings.flatMap((recording) =>
      recording.transactions.filter(
        (transaction) => transaction.type === "CREDIT"
      )
    );

    const totalDebit = debitRecordings.reduce(
      (acc, account) => acc + account.amount,
      0
    );

    const totalCredit = creditRecordings.reduce(
      (acc, account) => acc + account.amount,
      0
    );

    if (totalDebit !== totalCredit) {
      setRecordingError(true);
    } else {
      setSteps([true, true]);
      setRecordingError(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Balance</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex w-full items-center">
        <main
          className={clsx(
            "mx-auto flex-col items-center p-5",
            'before:absolute before:left-0 before:top-[55px] before:z-[-1] before:h-[365px] before:w-full before:bg-black before:content-[""]'
          )}
        >
          <div className="mt-10 flex flex-col gap-4">
            <Link
              href="/"
              className="flex w-full flex-row items-baseline gap-2 text-left text-xs text-gray-400"
            >
              <IoMdArrowBack className="h-3 w-3" />
              Back
            </Link>
            <div className="flex flex-col gap-2">
              <p className="font-body text-4xl font-semibold tracking-tight text-white">
                Balance creation
              </p>
              <p className="text-sm font-medium text-gray-400">
                Please follow the steps to configure your Balance accounts.
              </p>
            </div>
          </div>
          <div
            className={clsx(
              "mt-12 flex w-full flex-col gap-16 md:flex-row",
              "font-body"
            )}
          >
            <div className="max-w-auto flex w-full flex-col gap-12 md:max-w-[288px]">
              <div className="flex flex-col gap-5 rounded-md bg-[#333] p-5">
                <div className="relative h-40 w-full md:w-[240px] ">
                  <Image
                    className="rounded-md object-cover"
                    src="/images/plan-comptable.png"
                    fill
                    alt="Plan comptable Image"
                  />
                </div>
                <div
                  className={clsx("text-md flex flex-col gap-2", "font-body")}
                >
                  <a
                    className="flex flex-row items-center gap-2 text-white"
                    href="https://www.plancomptable.com/en/french-chart-of-accounts.htm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Plan comptable
                    <BiLinkExternal className="h-4 w-4" />
                  </a>
                  <p className="text-sm font-normal text-gray-400">
                    The &quot;Plan Comptable&quot; is necessary to know account
                    numbers.
                  </p>
                </div>
              </div>
              <div className="flex hidden flex-col gap-4 md:flex">
                <div className="flex flex-col text-sm">
                  <div
                    className={clsx(
                      "relative",
                      "text-white",
                      steps[0] ? "after:bg-white" : "after:bg-zinc-700",
                      "after:absolute after:left-2 after:top-5 after:h-10 after:w-px after:content-['']"
                    )}
                  >
                    <p
                      className={clsx(
                        "font-medium before:z-10 before:mr-2 before:align-sub before:text-4xl before:content-['•']"
                      )}
                    >
                      General Info
                    </p>
                  </div>
                  <div
                    className={clsx(
                      "relative",
                      steps[0] ? "text-white" : "text-zinc-700",
                      steps[1] ? "after:bg-white" : "after:bg-zinc-700",
                      "after:absolute after:left-2 after:top-5 after:h-10 after:w-px after:content-['']"
                    )}
                  >
                    <p
                      className={clsx(
                        "font-medium before:mr-2 before:align-sub before:text-4xl before:content-['•']"
                      )}
                    >
                      Recordings
                    </p>
                  </div>
                  <div
                    className={clsx(steps[1] ? "text-white" : "text-zinc-700")}
                  >
                    <p
                      className={clsx(
                        "font-medium before:mr-2 before:align-sub before:text-4xl before:content-['•']"
                      )}
                    >
                      Confirmation
                    </p>
                  </div>
                </div>
                <hr className="border-px border-border-primary" />
                <div className={clsx("flex flex-col gap-2", "font-body")}>
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    Account info
                  </p>
                  <div className="flex flex-row items-center gap-2 text-sm text-white">
                    <MdBookmark />
                    <p>Name</p>
                  </div>
                  <div className="flex flex-row items-center gap-2 text-sm text-zinc-500">
                    <AiFillCalendar />
                    <p>Created on 12/12/2021</p>
                  </div>
                </div>
                <hr className="border-px border-border-primary" />
              </div>
            </div>
            <div className="flex w-full max-w-[838px] flex-col gap-10 font-body">
              <div className="flex w-full flex-col gap-5 rounded-md border border-border-primary bg-black p-5">
                <h3
                  className={clsx(
                    "text-xl font-semibold",
                    steps[0] ? "text-zinc-500" : "text-white"
                  )}
                >
                  General Information
                </h3>
                <hr className="border-border-primary" />
                <p className="text-sm font-normal tracking-tight text-text-primary">
                  To ensure you can easily update your project after publishing
                  it, you need to specify information about it so that you can
                  easily find it later.
                </p>
                <div className="flex flex-col gap-6 rounded-md border border-border-primary bg-bg-primary p-3">
                  <div className="flex flex-col gap-2">
                    <label
                      className={clsx(
                        "text-sm font-medium text-white",
                        steps[0] ? "text-zinc-500" : "text-white"
                      )}
                      htmlFor="input-name"
                    >
                      Name
                    </label>
                    <input
                      disabled={steps[0]}
                      id="input-name"
                      className="h-10 w-full rounded-md border border-border-primary bg-black px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      placeholder="An interesting name that you like..."
                      onChange={(e) =>
                        setGeneralInfo({ ...generalInfo, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="input-description"
                      className={clsx(
                        "text-sm font-medium text-white",
                        steps[0] ? "text-zinc-500" : "text-white"
                      )}
                    >
                      Description
                    </label>
                    <input
                      disabled={steps[0]}
                      id="input-description"
                      className="h-10 w-full rounded-md border border-border-primary bg-black px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      placeholder="What is your project about?"
                      onChange={(e) =>
                        setGeneralInfo({
                          ...generalInfo,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="input-purpose"
                      className={clsx(
                        "text-sm font-medium text-white",
                        steps[0] ? "text-zinc-500" : "text-white"
                      )}
                    >
                      Purpose
                    </label>
                    <input
                      disabled={steps[0]}
                      id="input-purpose"
                      className="h-10 w-full rounded-md border border-border-primary bg-black px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      placeholder="Why do you need this project?"
                      onChange={(e) =>
                        setGeneralInfo({
                          ...generalInfo,
                          purpose: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex w-full justify-end">
                  <button
                    type="button"
                    disabled={
                      !generalInfo.name ||
                      !generalInfo.description ||
                      !generalInfo.purpose ||
                      steps[0]
                    }
                    className={clsx(
                      "inline-flex w-fit rounded-md border border-transparent bg-white px-4 py-2 text-base font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    onClick={() => {
                      setSteps([true, false]);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="flex w-full flex-col gap-5 rounded-md border border-border-primary bg-black p-5">
                <h3
                  className={clsx(
                    "text-xl font-semibold",
                    steps[0] && !steps[1] ? "text-white" : "text-zinc-500"
                  )}
                >
                  Recordings
                </h3>
                <hr className="border-border-primary" />
                <p className="text-sm font-normal tracking-tight text-text-primary">
                  Your balance accounts can only be populated with transactions
                  that have been recorded. Make sure to input every recording to
                  ensure the validity of your balance accounts.
                </p>
                <div className="flex flex-col gap-6 rounded-md border border-border-primary bg-bg-primary p-3">
                  <div className="flex w-full justify-end">
                    <button
                      disabled={!steps[0] || steps[1]}
                      className="flex flex-row items-center gap-1 rounded-md bg-white p-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setIsOpen(true)}
                    >
                      <IoMdAdd className="h-5 w-5 text-black" />
                      Add
                    </button>
                  </div>
                  {recordings.length ? (
                    <table className="text-white">
                      <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header, index) => (
                              <th
                                key={header.id}
                                className={clsx(
                                  index === headerGroup.headers.length - 1
                                    ? "text-right"
                                    : "text-left"
                                )}
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody ref={parent}>
                        {table.getRowModel().rows.map((row) => (
                          <tr key={row.id}>
                            {row.getVisibleCells().map((cell, index) => (
                              <td
                                key={cell.id}
                                className={clsx(
                                  index === row.getVisibleCells().length - 1
                                    ? "float-right"
                                    : "text-left"
                                )}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-normal tracking-tight text-text-primary">
                        You have no recordings yet.
                      </p>
                      <p className="text-sm font-normal tracking-tight text-text-primary">
                        Click the button above to add a new recording.
                      </p>
                    </div>
                  )}
                </div>
                {recordingError && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-normal tracking-tight text-text-primary">
                      Something is wrong with your recordings. The total debit
                      is not equal to the total credit.
                    </p>
                    <p>
                      Make sure you did not forget or made a mistake when
                      inputing your transactions.
                    </p>
                  </div>
                )}
                <div className="flex w-full justify-end">
                  <button
                    type="button"
                    disabled={!steps[0] || !recordings.length || steps[1]}
                    className={clsx(
                      "inline-flex w-fit rounded-md border border-transparent bg-white px-4 py-2 text-base font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    onClick={checkRecordings}
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="flex w-full flex-col gap-5 rounded-md border border-border-primary bg-black p-5 ">
                <h3
                  className={clsx(
                    "text-xl font-semibold",
                    steps[0] && steps[1] ? "text-white" : "text-zinc-500"
                  )}
                >
                  Confirmation
                </h3>
                <hr className="border-border-primary" />
                <p className="text-sm font-normal tracking-tight text-text-primary">
                  Make sure the information you provided are correct. Otherwise,
                  the financial statements will be inaccurate.
                </p>
                <div className="flex flex-row items-center gap-2">
                  <input
                    disabled={!steps[0] || !steps[1]}
                    id="checkbox-confirmation"
                    className={clsx(
                      "relative h-4 w-4 cursor-pointer appearance-none rounded-sm border border-border-primary bg-black text-sm text-white checked:bg-blue-500",
                      !isChecked && "before:hidden",
                      "before:absolute before:-top-px before:left-px before:z-10 before:text-sm before:font-bold before:text-white before:content-['✓']",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    type="checkbox"
                    onChange={() => setIsChecked(!isChecked)}
                  />

                  <label
                    className={clsx(
                      "text-sm font-medium text-white",
                      steps[0] && steps[1]
                        ? "text-white"
                        : "cursor-not-allowed text-zinc-500 opacity-50"
                    )}
                    onClick={() => {
                      if (steps[0] && steps[1]) setIsChecked(!isChecked);
                    }}
                    htmlFor="checkbox-confirmation"
                  >
                    I confirm that the information I provided are correct.
                  </label>
                </div>
                <div className="flex w-full justify-end">
                  <button
                    disabled={!steps[0] || !steps[1] || !isChecked || isLoading}
                    type="button"
                    className={clsx(
                      "inline-flex w-fit rounded-md border border-transparent bg-white px-4 py-2 text-base font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <div className="flex flex-row items-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-500"/>
                        <p>Creating balance...</p>
                      </div>
                    ) : (
                      <>Finish</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <CreateRecordingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={(newRecording) => {
          setRecordings([...recordings, newRecording]);
          setIsOpen(false);
        }}
      />
    </>
  );
}

type CreateRecordingModalProps = {
  isOpen: boolean;
  onSave: (recording: Recording) => void;
  onClose: () => void;
};

function CreateRecordingModal({
  isOpen,
  onClose,
  onSave,
}: CreateRecordingModalProps) {
  const parent = useRef(null);
  const [recording, setRecording] = useState<Omit<Recording, "transactions">>({
    date: new Date(),
    type: "INVOICE",
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  useEffect(() => {
    if (isOpen) {
      setTransactions([]);
    }
  }, [isOpen]);
  return (
    <>
      <div
        className={clsx("z-10 font-body", !isOpen && "hidden")}
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={clsx(
            "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
            isOpen ? "opacity-75" : "opacity-0"
          )}
        />

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-bg-primary px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 flex w-full flex-col gap-4 sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg font-medium leading-6 text-white"
                      id="modal-title"
                    >
                      New Recording
                    </h3>
                    <div className="flex flex-row gap-4">
                      <div className="flex w-fit flex-col gap-2">
                        <label
                          htmlFor="date"
                          className="text-sm font-semibold uppercase text-white"
                        >
                          Date
                        </label>
                        <input
                          id="date"
                          className="h-10 w-full rounded-md border border-border-primary bg-black px-3 text-sm text-white"
                          type="date"
                          onChange={(e) => {
                            setRecording({
                              ...recording,
                              date: new Date(e.target.value),
                            });
                          }}
                        />
                      </div>
                      <div className="flex w-fit flex-col gap-2">
                        <label
                          htmlFor="select-type"
                          className="text-sm font-semibold uppercase text-white"
                        >
                          Type
                        </label>
                        <select
                          id="select-type"
                          className="h-10 w-full rounded-md border border-border-primary bg-black px-3 text-sm text-white"
                          onChange={(e) => {
                            setRecording({
                              ...recording,
                              type: e.target.value as RecordingType,
                            });
                          }}
                        >
                          <option value="INVOICE">Invoice</option>
                          <option value="TRANSFER">Transfer</option>
                          <option value="PAYMENT">Payment</option>
                          <option value="WITHDRAWAL">Withdrawal</option>
                        </select>
                      </div>
                    </div>
                    <hr className="border border-border-primary" />
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row justify-between text-sm font-semibold uppercase text-white">
                        Accounts
                        <IoMdAdd
                          onClick={() => {
                            setTransactions((prev) => [
                              ...prev,
                              {
                                type: "DEBIT",
                                accountNumber: "10000",
                                amount: 0,
                              },
                            ]);
                          }}
                          className="h-5 w-5 cursor-pointer text-white"
                        />
                      </div>
                      <div ref={parent} className="flex flex-col gap-6">
                        {transactions.map((_, index) => (
                          <div
                            key={index}
                            className="flex flex-row justify-between"
                          >
                            <div className="flex flex-row items-center gap-5">
                              <div className="flex flex-col gap-1">
                                <label
                                  htmlFor="select-type"
                                  className="text-sm font-semibold uppercase text-white"
                                >
                                  Type
                                </label>
                                <select
                                  id="select-type"
                                  className="h-10 w-24 rounded-md border border-border-primary bg-black px-3 text-sm text-white"
                                  onChange={(e) => {
                                    const newAccounts = [...transactions];
                                    const account = newAccounts[index];
                                    if (!account) return;
                                    account.type = e.target
                                      .value as TransactionType;
                                    newAccounts[index] = account;
                                    setTransactions(newAccounts);
                                  }}
                                >
                                  <option value="DEBIT">Debit</option>
                                  <option value="CREDIT">Credit</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label
                                  htmlFor="input-number"
                                  className="text-sm font-semibold uppercase text-white"
                                >
                                  Account Number
                                </label>
                                <select
                                  id="input-number"
                                  className="h-10 w-full rounded-md border border-border-primary bg-black px-3 text-sm text-white"
                                  onChange={(e) => {
                                    const newAccounts = [...transactions];
                                    const account = newAccounts[index];
                                    if (!account) return;
                                    account.accountNumber = e.target.value;
                                    newAccounts[index] = account;
                                    setTransactions(newAccounts);
                                  }}
                                >
                                  {Object.entries(categorizedClasses).map(
                                    ([groupKey, value]) => (
                                      <optgroup
                                        key={groupKey}
                                        label={`${groupKey} - ${
                                          allClasses[
                                            `CLASS ${groupKey}` as keyof typeof allClasses
                                          ]
                                        }`}
                                      >
                                        {value.map(({ key, value }) => (
                                          <option key={key} value={key}>
                                            {key} - {value}
                                          </option>
                                        ))}
                                      </optgroup>
                                    )
                                  )}
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label
                                  htmlFor="input-amount"
                                  className="text-sm font-semibold uppercase text-white"
                                >
                                  Amount
                                </label>
                                <input
                                  id="input-amount"
                                  className="h-10 w-24 rounded-md border border-border-primary bg-black px-3 text-sm text-white"
                                  type="number"
                                  onChange={(e) => {
                                    const newAccounts = [...transactions];
                                    const account = newAccounts[index];
                                    if (!account) return;
                                    account.amount = parseInt(e.target.value);
                                    newAccounts[index] = account;
                                    setTransactions(newAccounts);
                                  }}
                                />
                              </div>
                              <div className="flex items-center">
                                <IoMdTrash
                                  onClick={() => {
                                    setTransactions((prev) =>
                                      prev.filter((_, i) => i !== index)
                                    );
                                  }}
                                  className="h-5 w-5 cursor-pointer text-white"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-bg-primary px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  disabled={transactions.length === 0}
                  type="button"
                  onClick={() =>
                    onSave({
                      date: recording?.date || new Date(),
                      type: recording?.type || "INVOICE",
                      transactions,
                    })
                  }
                  className={clsx(
                    "inline-flex w-full justify-center rounded-md border border-transparent bg-teal-800 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="disabled mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
