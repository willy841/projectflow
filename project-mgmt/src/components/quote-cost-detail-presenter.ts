export type QuoteCostDetailPresenter = {
  mode: "active" | "closed";
  archived: boolean;
  activePath: "/quote-costs" | "/closeouts";
  listHref: "/quote-costs" | "/closeouts";
  listLabel: string;
  shellTitle: string;
  collectionTitle: string;
  collectionPrimaryActionLabel: string;
  quotationLockedLabel: string;
  costSectionLockedLabel: string;
  canCreateCollectionRecord: boolean;
  canDeleteCollectionRecord: boolean;
  canAddManualCost: boolean;
  canConfirmReconciliationGroup: boolean;
  canPersistManualCosts: boolean;
  canCloseProject: boolean;
};

const activePresenter: QuoteCostDetailPresenter = {
  mode: "active",
  archived: false,
  activePath: "/quote-costs",
  listHref: "/quote-costs",
  listLabel: "報價成本列表",
  shellTitle: "成本管理 / 對帳推進",
  collectionTitle: "收款管理",
  collectionPrimaryActionLabel: "新增收款",
  quotationLockedLabel: "已承接正式報價版本",
  costSectionLockedLabel: "已結案留存版本",
  canCreateCollectionRecord: true,
  canDeleteCollectionRecord: true,
  canAddManualCost: true,
  canConfirmReconciliationGroup: true,
  canPersistManualCosts: true,
  canCloseProject: true,
};

const closeoutRetainedPresenter: QuoteCostDetailPresenter = {
  mode: "closed",
  archived: true,
  activePath: "/closeouts",
  listHref: "/closeouts",
  listLabel: "結案列表",
  shellTitle: "結案留存 / 結果確認",
  collectionTitle: "收款留存",
  collectionPrimaryActionLabel: "新增收款",
  quotationLockedLabel: "結案版本已鎖定",
  costSectionLockedLabel: "已結案留存版本",
  canCreateCollectionRecord: false,
  canDeleteCollectionRecord: false,
  canAddManualCost: false,
  canConfirmReconciliationGroup: false,
  canPersistManualCosts: false,
  canCloseProject: false,
};

export function getQuoteCostDetailPresenter(mode: "active" | "closed"): QuoteCostDetailPresenter {
  return mode === "closed" ? closeoutRetainedPresenter : activePresenter;
}

export function getCloseoutRetainedPresenter(): QuoteCostDetailPresenter {
  return closeoutRetainedPresenter;
}
