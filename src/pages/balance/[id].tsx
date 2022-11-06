import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import clsx from "clsx";
import { format } from "date-fns";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AiFillCheckCircle, AiOutlineCheckCircle } from "react-icons/ai";
import { IoMdArrowBack } from "react-icons/io";
import { useIntersection } from "react-use";
import classes from "../../data/classes.json";
import { trpc } from "../../utils/trpc";

const allClasses = classes;

type BalanceRecording = {
  id: string;
  date: Date;
  accountNumber: string;
  accountName: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
};

type AccountingBalanceRow = {
  accountName: string;
  accountNumber: string;
  debit: number;
  credit: number;
};

const BalanceRecordingColumnHelper = createColumnHelper<BalanceRecording>();
const AccountingBalanceColumnHelper =
  createColumnHelper<AccountingBalanceRow>();

const recordingColumns = [
  BalanceRecordingColumnHelper.accessor("accountNumber", {
    id: "accountNumber",
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <div className="rounded-sm px-2 text-white">Account</div>,
  }),
  BalanceRecordingColumnHelper.accessor("date", {
    id: "date",
    size: 1,
    cell: (info) => <i>{format(info.getValue(), "dd/MM/yyyy")}</i>,
    header: () => <div className="rounded-sm px-2 text-white">Date</div>,
  }),
  BalanceRecordingColumnHelper.accessor("accountName", {
    id: "accountName",
    size: 50,
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => (
      <div className="rounded-sm px-2 text-white">Account Name</div>
    ),
  }),
  BalanceRecordingColumnHelper.display({
    id: "debit",
    size: 1,
    cell: (props) =>
      props.row.original.type === "DEBIT" ? (
        <i>{props.row.original.amount}</i>
      ) : (
        <i></i>
      ),
    header: () => <div className="rounded-sm px-2 text-white">Debit</div>,
  }),
  BalanceRecordingColumnHelper.display({
    id: "credit",
    size: 1,
    cell: (props) =>
      props.row.original.type === "CREDIT" ? (
        <i>{props.row.original.amount}</i>
      ) : (
        <i></i>
      ),
    header: () => <div className="rounded-sm px-2 text-white">Credit</div>,
  }),
];

const accountingBalanceColumns = [
  AccountingBalanceColumnHelper.accessor("accountNumber", {
    id: "accountNumber",
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => (
      <div className="rounded-l-md border-y border-l border-border-primary bg-bg-primary px-4 py-2 text-white">
        Account
      </div>
    ),
  }),
  AccountingBalanceColumnHelper.accessor("accountName", {
    id: "accountName",
    size: 50,
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => (
      <div className="border-y border-border-primary bg-bg-primary px-4 py-2 text-white">
        Account Name
      </div>
    ),
  }),
  AccountingBalanceColumnHelper.display({
    id: "debit",
    size: 1,
    cell: (props) =>
      props.row.original.debit > props.row.original.credit ? (
        <span className="text-text-secondary">
          {Math.abs(props.row.original.debit - props.row.original.credit)}
        </span>
      ) : (
        <i></i>
      ),
    header: () => (
      <div className="border-y border-border-primary bg-bg-primary px-4 py-2 text-white">
        Debit
      </div>
    ),
  }),
  AccountingBalanceColumnHelper.display({
    id: "credit",
    size: 1,
    cell: (props) =>
      props.row.original.debit < props.row.original.credit ? (
        <span className="text-text-secondary">
          {Math.abs(props.row.original.debit - props.row.original.credit)}
        </span>
      ) : (
        <i></i>
      ),
    header: () => (
      <div className="rounded-r-md border-y border-r border-border-primary bg-bg-primary px-4 py-2 text-white">
        Credit
      </div>
    ),
  }),
];

const defaultOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
};

export default function BalanceDetails() {
  const route = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const { data, isLoading, error } = trpc.balance.getById.useQuery({
    id: parseInt((route.query.id as string) ?? "0"),
  });
  const [isScrolling, setScrolling] = useState(false);

  const generalInfoRef = useRef<HTMLDivElement>(null);
  const generalInfoIntersection = useIntersection(
    generalInfoRef,
    defaultOptions
  );
  const recordingRef = useRef<HTMLDivElement>(null);
  const recordingIntersection = useIntersection(recordingRef, defaultOptions);
  const ledgerRef = useRef<HTMLDivElement>(null);
  const ledgerIntersection = useIntersection(ledgerRef, defaultOptions);
  const accountingBalanceRef = useRef<HTMLDivElement>(null);
  const accountingBalanceIntersection = useIntersection(
    accountingBalanceRef,
    defaultOptions
  );
  const incomeStatementRef = useRef<HTMLDivElement>(null);
  const incomeStatementIntersection = useIntersection(
    incomeStatementRef,
    defaultOptions
  );
  const balanceSheetRef = useRef<HTMLDivElement>(null);
  const balanceSheetIntersection = useIntersection(
    balanceSheetRef,
    defaultOptions
  );

  const tabs = useMemo(
    () => [
      {
        name: "General Info",
        ref: generalInfoRef,
        intersection: generalInfoIntersection,
      },
      {
        name: "Recording Book",
        ref: recordingRef,
        intersection: recordingIntersection,
      },
      {
        name: "Ledger Book",
        ref: ledgerRef,
        intersection: ledgerIntersection,
      },
      {
        name: "Accounting Balance",
        ref: accountingBalanceRef,
        intersection: accountingBalanceIntersection,
      },
      {
        name: "Income Statement",
        ref: incomeStatementRef,
        intersection: incomeStatementIntersection,
      },
      {
        name: "Balance Sheet",
        ref: balanceSheetRef,
        intersection: balanceSheetIntersection,
      },
    ],
    [
      accountingBalanceIntersection,
      balanceSheetIntersection,
      generalInfoIntersection,
      incomeStatementIntersection,
      ledgerIntersection,
      recordingIntersection,
    ]
  );

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.intersection?.isIntersecting);
    if (activeTab && !isScrolling) {
      setActiveTab(
        tabs.indexOf(activeTab) - 1 > 0 ? tabs.indexOf(activeTab) - 1 : 0
      );
    }
  }, [isScrolling, tabs]);

  const flatRecordings = useMemo(() => {
    return data?.recordings.flatMap((recording) =>
      recording.transactions.map((transaction) => ({
        id: recording.id,
        date: recording.date,
        accountNumber: transaction.accountNumber,
        accountName:
          allClasses[transaction.accountNumber as keyof typeof allClasses],
        amount: transaction.amount,
        type: transaction.type as "CREDIT" | "DEBIT",
      }))
    );
  }, [data]);

  const flatAccounts = useMemo(() => {
    return [
      ...new Set(
        flatRecordings?.map((recording) => recording.accountNumber) ?? []
      ),
    ].map((accountNumber) => {
      const accountName = allClasses[accountNumber as keyof typeof allClasses];
      const transactions = flatRecordings?.filter(
        (recording) => recording.accountNumber === accountNumber
      );
      const debit = transactions?.filter(
        (transaction) => transaction.type === "DEBIT"
      );
      const credit = transactions?.filter(
        (transaction) => transaction.type === "CREDIT"
      );
      return {
        accountNumber,
        accountName,
        debit: debit?.reduce((acc, cur) => acc + cur.amount, 0) ?? 0,
        credit: credit?.reduce((acc, cur) => acc + cur.amount, 0) ?? 0,
      };
    });
  }, [flatRecordings]);

  const recordingsTable = useReactTable({
    data: flatRecordings ?? [],
    columns: recordingColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const accountingBalanceTable = useReactTable({
    data:
      flatAccounts?.sort(
        (a, b) => parseInt(a.accountNumber) - parseInt(b.accountNumber)
      ) ?? [],
    columns: accountingBalanceColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const profit =
    flatAccounts
      ?.filter((account) => account.accountNumber.startsWith("7"))
      .map((account) => Math.abs(account.debit - account.credit))
      .reduce((a, b) => a + b, 0) -
    flatAccounts
      .filter((account) => account.accountNumber.startsWith("6"))
      .map((account) => Math.abs(account.debit - account.credit))
      .reduce((a, b) => a + b, 0);

  return (
    <>
      <Head>
        <title>Balance Details</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex w-full items-center">
        <main
          className={clsx(
            "mx-auto max-w-[1200px] flex-col items-center p-5",
            'before:absolute before:left-0 before:top-[55px] before:z-[-1] before:h-[250px] before:w-full before:border-b before:border-border-primary before:bg-black before:content-[""]'
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
            <div className="flex w-full flex-row items-center justify-between">
              <p className="font-body text-4xl font-semibold tracking-tight text-white">
                Balance
              </p>
              <p className="text-sm font-medium text-gray-400">
                {format(data?.date ?? new Date(), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
          <div className="divide-x-border-primary relative top-0 z-10 mt-[70px] flex w-full flex-col items-center justify-items-center divide-x rounded-t-md border border-border-primary bg-black text-sm text-border-primary text-text-secondary md:sticky md:flex-row">
            {tabs.map((tab, index) => (
              <div
                key={index}
                className={clsx(
                  "flex w-full cursor-pointer flex-row items-center gap-2 whitespace-nowrap border border-border-primary py-3 px-5",
                  activeTab === index && "border-b-white text-white"
                )}
                onClick={() => {
                  setActiveTab(index);
                  setScrolling(true);
                  window.scrollTo({
                    top: (tab.ref.current?.offsetTop ?? 0) + 20,
                    behavior: "smooth",
                  });
                  setTimeout(() => {
                    setScrolling(false);
                  }, 2000);
                }}
              >
                {activeTab === index ? (
                  <AiFillCheckCircle className="h-5 w-5 text-blue-500" />
                ) : (
                  <AiOutlineCheckCircle className="h-5 w-5" />
                )}
                {tab.name}
              </div>
            ))}
          </div>
          {isLoading ? (
            <div className="mt-10 flex w-full flex-col items-center justify-center">
              <div className="h-24 w-24 animate-spin rounded-full border-b-2 border-gray-500" />
            </div>
          ) : (
            !error && (
              <>
                <div className="w-full pt-14">
                  <p
                    className="font-body text-2xl font-semibold tracking-tight text-white"
                    ref={generalInfoRef}
                  >
                    General Info
                  </p>
                  <div className="mt-8 w-full rounded rounded-sm border border-border-primary bg-black text-white">
                    <div className="flex flex-col gap-1 border-b border-border-primary p-6">
                      <span className="text-md font-semibold text-white">
                        Balance information
                      </span>
                      <span className="text-sm font-medium text-text-secondary">
                        See the balance info to know why it has been created and
                        generated.
                      </span>
                    </div>
                    <div className="flex flex-col gap-6 rounded-md border border-border-primary bg-bg-primary p-6">
                      <div className="flex flex-col gap-2">
                        <label
                          className={clsx("text-sm font-medium text-white")}
                          htmlFor="input-name"
                        >
                          Name
                        </label>
                        <input
                          disabled
                          value={data?.name}
                          id="input-name"
                          className="h-10 w-full rounded-md border border-border-primary bg-black px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                          type="text"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="input-description"
                          className={clsx("text-sm font-medium text-white")}
                        >
                          Description
                        </label>
                        <input
                          disabled
                          id="input-description"
                          className="h-10 w-full rounded-md border border-border-primary bg-black px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                          type="text"
                          placeholder="What is your project about?"
                          value={data?.description}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="input-purpose"
                          className={clsx("text-sm font-medium text-white")}
                        >
                          Purpose
                        </label>
                        <input
                          disabled
                          id="input-purpose"
                          className="h-10 w-full rounded-md border border-border-primary bg-black px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                          type="text"
                          value={data?.purpose}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full pt-14">
                  <p className="font-body text-2xl font-semibold tracking-tight text-white">
                    Centralization & Recording
                  </p>
                  <div className="mt-8 w-full rounded rounded-sm border border-border-primary bg-black text-white">
                    <div className="flex flex-col gap-1 border-b border-border-primary p-6">
                      <span
                        className="text-md font-semibold text-white"
                        ref={recordingRef}
                      >
                        Recording Book
                      </span>
                      <span className="text-sm font-medium text-text-secondary">
                        View all the transactions organized with account numbers
                        and recording.
                      </span>
                    </div>
                    <div
                      className={
                        "w-[calc(100vw-40px)] overflow-x-scroll p-6 md:w-full"
                      }
                    >
                      {flatAccounts?.length && (
                        <table className="w-full bg-bg-primary px-6">
                          <thead className="bg-black">
                            {recordingsTable
                              .getHeaderGroups()
                              .map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                  {headerGroup.headers.map((header, idx) => (
                                    <th
                                      key={header.id}
                                      className={clsx(
                                        (idx <= 1 || idx >= 3) && "w-20",
                                        "px-4 py-2"
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
                          <tbody>
                            {recordingsTable
                              .getRowModel()
                              .rows.map((row, index, arr) => (
                                <tr key={row.id}>
                                  {row.getVisibleCells().map((cell, idx) => (
                                    <td
                                      key={cell.id}
                                      className={clsx(
                                        (idx <= 1 || idx >= 3) && "text-center",
                                        idx === 2 &&
                                          row.original.type === "CREDIT" &&
                                          "text-right",
                                        "border-x border-border-primary p-4",
                                        arr[index - 1]?.original.id !==
                                          row.original.id &&
                                          "border-t border-border-primary",
                                        index === arr.length - 1 && "border-b"
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
                      )}
                    </div>
                  </div>
                  <div className="mt-8 w-full rounded rounded-sm border border-border-primary bg-black text-white">
                    <div className="flex flex-col gap-1 border-b border-border-primary p-6">
                      <span
                        className="text-md font-semibold text-white"
                        ref={ledgerRef}
                      >
                        The Ledger Book
                      </span>
                      <span className="text-sm font-medium text-text-secondary">
                        The Ledger Book allows you to organize every amount by
                        account number so that it will be easier to see the
                        balance of each for the accounting balance.
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-row flex-wrap items-start gap-10">
                        {flatRecordings?.length &&
                          [
                            ...new Set(
                              flatRecordings.map((item) => item.accountNumber)
                            ),
                          ].map((item) => (
                            <LedgerTable
                              key={item}
                              accountName={
                                allClasses[item as keyof typeof allClasses]
                              }
                              accountNumber={parseInt(item)}
                              transactions={flatRecordings.filter(
                                (transaction) =>
                                  transaction.accountNumber === item
                              )}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 w-full rounded rounded-sm border border-border-primary bg-black text-white">
                    <div className="flex flex-col gap-1 border-b border-border-primary p-6">
                      <span
                        className="text-md font-semibold text-white"
                        ref={accountingBalanceRef}
                      >
                        The Accounting Balance
                      </span>
                      <span className="text-sm font-medium text-text-secondary">
                        See every accounts&apos; balance in an organized table.
                      </span>
                    </div>
                    <div
                      className={
                        "w-[calc(100vw-40px)] overflow-x-scroll p-6 md:w-full"
                      }
                    >
                      {flatAccounts?.length && (
                        <table className="w-full px-6">
                          <thead className="bg-bg-primary">
                            {accountingBalanceTable
                              .getHeaderGroups()
                              .map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                  {headerGroup.headers.map((header, idx) => (
                                    <th
                                      key={header.id}
                                      className={clsx(
                                        (idx >= 2 || idx === 0) && "w-20"
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
                          <tbody>
                            {accountingBalanceTable
                              .getRowModel()
                              .rows.map((row) => (
                                <tr key={row.id}>
                                  {row.getVisibleCells().map((cell) => (
                                    <td
                                      key={cell.id}
                                      className={clsx(
                                        "border-b border-border-primary p-4"
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
                            <tr className="bg-black">
                              <td className="border-t border-border-primary p-4" />
                              <td className="border-t border-border-primary p-4">
                                <span className="text-md font-bold uppercase">
                                  Total
                                </span>{" "}
                              </td>
                              <td className="border-t border-border-primary p-4">
                                <span className="text-md font-bold uppercase">
                                  {flatAccounts
                                    .filter(
                                      (account) =>
                                        account.debit >= account.credit
                                    )
                                    .map((acount) =>
                                      Math.abs(acount.debit - acount.credit)
                                    )
                                    .reduce((a, b) => a + b, 0)}
                                </span>
                              </td>
                              <td className="border-t border-border-primary p-4">
                                <span className="text-md font-bold uppercase">
                                  {flatAccounts
                                    .filter(
                                      (account) =>
                                        account.debit <= account.credit
                                    )
                                    .reduce((a, b) => a + b.credit, 0)}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full pt-14">
                  <p className="font-body text-2xl font-semibold tracking-tight text-white">
                    Summary Statements
                  </p>
                  <div className="mt-8 w-full rounded rounded-sm border border-border-primary bg-black text-white">
                    <div className="flex flex-col gap-1 border-b border-border-primary p-6">
                      <span
                        className="text-md font-semibold text-white"
                        ref={incomeStatementRef}
                      >
                        Income Statement
                      </span>
                      <span className="text-sm font-medium text-text-secondary">
                        Income Statement regroups all recordings that are
                        related to income and expenses.
                      </span>
                    </div>
                    <div className="w-full p-6">
                      {flatRecordings?.length && (
                        <div className="flex flex-col bg-bg-primary md:flex-row">
                          <div className="flex w-full flex-col rounded-l-md border border-border-primary md:w-1/2">
                            <div className="border-b border-border-primary bg-black p-4 text-center text-lg font-bold uppercase">
                              Expenses
                            </div>
                            <div className="flex flex-col bg-bg-primary py-4 px-6">
                              {flatAccounts
                                .filter((account) =>
                                  account.accountNumber.startsWith("6")
                                )
                                .map((account) => (
                                  <div
                                    key={account.accountNumber}
                                    className="flex flex-row justify-between"
                                  >
                                    <span>
                                      {account.accountNumber}.{" "}
                                      {account.accountName}
                                    </span>
                                    {Math.abs(account.debit - account.credit)}
                                  </div>
                                ))}
                              <div className="text-md mt-5 flex flex-row gap-4 font-bold uppercase">
                                <span className="">PROFIT</span>
                                {profit}
                              </div>
                            </div>
                          </div>
                          <div className="flex w-full flex-col rounded-r-md border border-border-primary md:w-1/2">
                            <div className="border-b border-border-primary bg-black p-4 text-center text-lg font-bold uppercase">
                              Income
                            </div>
                            <div className="flex flex-col bg-bg-primary py-4 px-6">
                              {flatAccounts
                                .filter((account) =>
                                  account.accountNumber.startsWith("7")
                                )
                                .map((account) => (
                                  <div
                                    key={account.accountNumber}
                                    className="flex flex-row justify-between"
                                  >
                                    <span>
                                      {account.accountNumber}.{" "}
                                      {account.accountName}
                                    </span>
                                    {Math.abs(account.debit - account.credit)}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 w-full rounded rounded-sm border border-border-primary bg-black text-white">
                    <div className="flex flex-col gap-1 border-b border-border-primary p-6">
                      <span
                        className="text-md font-semibold text-white"
                        ref={balanceSheetRef}
                      >
                        Balance Sheet
                      </span>
                      <span className="text-sm font-medium text-text-secondary">
                        The balance sheet includes every transaction other than
                        income and expenses. If done correctly, total assets
                        should be equal to total liabilities.
                      </span>
                    </div>
                    <div className="w-full p-6">
                      {flatAccounts?.length && (
                        <>
                          <div className="flex w-full flex-col bg-bg-primary md:flex-row">
                            <div className="flex w-full flex-col rounded-l-md border border-border-primary md:w-1/2">
                              <div className="border-b border-border-primary bg-black p-4 text-center text-lg font-bold uppercase">
                                Assets
                              </div>
                              <div className="flex flex-col gap-4 bg-bg-primary py-4 px-6">
                                <div>
                                  <span className="text-md font-bold uppercase">
                                    Fixed Assets
                                  </span>
                                  {flatAccounts
                                    .filter((account) =>
                                      account.accountNumber.startsWith("2")
                                    )
                                    .map((account) => (
                                      <div
                                        key={account.accountNumber}
                                        className="flex flex-row justify-between"
                                      >
                                        <span>
                                          {account.accountNumber}.{" "}
                                          {account.accountName}
                                        </span>
                                        {Math.abs(
                                          account.debit - account.credit
                                        )}
                                      </div>
                                    ))}
                                </div>
                                <div>
                                  <span className="text-md font-bold uppercase">
                                    Current Assets
                                  </span>
                                  {flatAccounts
                                    .filter((account) =>
                                      account.accountNumber.startsWith("5")
                                    )
                                    .map((account) => (
                                      <div
                                        key={account.accountNumber}
                                        className="flex flex-row justify-between"
                                      >
                                        <span>
                                          {account.accountNumber}.{" "}
                                          {account.accountName}
                                        </span>
                                        {Math.abs(
                                          account.debit - account.credit
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex w-full flex-col rounded-r-md border border-border-primary md:w-1/2">
                              <div className="border-b border-border-primary bg-black p-4 text-center text-lg font-bold uppercase">
                                Liabilities
                              </div>
                              <div className="flex flex-col gap-4 bg-bg-primary py-4 px-6">
                                <div>
                                  <span className="text-md font-bold uppercase">
                                    Equity
                                  </span>
                                  {flatAccounts
                                    .filter(
                                      (account) =>
                                        account.accountNumber.startsWith("1") &&
                                        !account.accountNumber.startsWith("16")
                                    )
                                    .map((account) => (
                                      <div
                                        key={account.accountNumber}
                                        className="flex flex-row justify-between"
                                      >
                                        <span>
                                          {account.accountNumber}.{" "}
                                          {account.accountName}
                                        </span>
                                        {Math.abs(
                                          account.debit - account.credit
                                        )}
                                      </div>
                                    ))}
                                  <div
                                    key="profit"
                                    className="flex flex-row justify-between"
                                  >
                                    <span>Profit</span>
                                    {profit}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-md font-bold uppercase">
                                    Other debts
                                  </span>
                                  {flatAccounts
                                    .filter(
                                      (account) =>
                                        (account.accountNumber.startsWith(
                                          "4"
                                        ) ||
                                          account.accountNumber.startsWith(
                                            "16"
                                          )) &&
                                        account.credit > account.debit
                                    )
                                    .map((account) => (
                                      <div
                                        key={account.accountNumber}
                                        className="flex flex-row justify-between"
                                      >
                                        <span>
                                          {account.accountNumber}.{" "}
                                          {account.accountName}
                                        </span>
                                        {Math.abs(
                                          account.debit - account.credit
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-primary flex w-full flex-row">
                            <div className="flex w-full flex-row justify-between rounded-b-md border border-border-primary p-5 md:w-1/2">
                              <span className="text-md font-bold uppercase">
                                Total
                              </span>
                              {flatAccounts
                                .filter((account) =>
                                  account.accountNumber.startsWith("2")
                                )
                                .map((account) =>
                                  Math.abs(account.debit - account.credit)
                                )
                                .reduce((a, b) => a + b, 0) +
                                flatAccounts
                                  .filter((account) =>
                                    account.accountNumber.startsWith("5")
                                  )
                                  .map((account) =>
                                    Math.abs(account.debit - account.credit)
                                  )
                                  .reduce((a, b) => a + b, 0)}
                            </div>
                            <div className="hidden w-full flex-row justify-between rounded-b-md border border-border-primary p-5 md:flex md:w-1/2">
                              <span className="text-md font-bold uppercase">
                                Total
                              </span>
                              {flatAccounts
                                .filter((account) =>
                                  account.accountNumber.startsWith("1")
                                )
                                .map((account) =>
                                  Math.abs(account.debit - account.credit)
                                )
                                .reduce((a, b) => a + b, 0) +
                                flatAccounts
                                  .filter(
                                    (account) =>
                                      account.accountNumber.startsWith("4") &&
                                      account.credit > account.debit
                                  )
                                  .map((account) =>
                                    Math.abs(account.debit - account.credit)
                                  )
                                  .reduce((a, b) => a + b, 0) +
                                profit}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </main>
      </div>
    </>
  );
}

type LedgerTableProps = {
  accountName: string;
  accountNumber: number;
  transactions: BalanceRecording[];
};
function LedgerTable({
  accountName,
  accountNumber,
  transactions,
}: LedgerTableProps) {
  const maxDebit = Math.max(
    0,
    ...transactions
      .filter((item) => item.type === "DEBIT")
      .map((item) => item.amount)
  );

  const maxCredit = Math.max(
    0,
    ...transactions
      .filter((item) => item.type === "CREDIT")
      .map((item) => item.amount)
  );

  const difference = Math.abs(maxDebit - maxCredit);

  return (
    <div className="flex flex-col justify-center rounded-md border border-border-primary bg-bg-primary p-4">
      <div className="flex flex-row justify-between border-b border-border-primary">
        <span>D</span>
        <span className="px-4 font-semibold">
          {accountNumber}. {accountName}
        </span>
        <span>C</span>
      </div>
      <div className="flex w-full flex-row justify-between divide-x divide-border-primary">
        <div className="flex w-1/2 flex-col px-2 py-2 text-right">
          {transactions
            .filter((item) => item.type === "DEBIT")
            .map((item) => (
              <span key={item.id}>{item.amount}</span>
            ))}
          {maxDebit < maxCredit && (
            <span className="mt-5 text-text-secondary">C.B. {difference}</span>
          )}
        </div>
        <div className="flex w-1/2 flex-col px-2 py-2 text-left">
          {transactions
            .filter((item) => item.type === "CREDIT")
            .map((item) => (
              <span key={item.id}>{item.amount}</span>
            ))}
          {maxDebit > maxCredit && (
            <span className="mt-5 text-text-secondary">D.B. {difference}</span>
          )}
        </div>
      </div>
    </div>
  );
}
