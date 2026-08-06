import { ProviderType, AccountingProviderAdapter } from "../types";
import { QuickBooksAdapter } from "../providers/quickbooks/api";
import { XeroAdapter } from "../providers/xero/api";
import { SageAdapter } from "../providers/sage/api";

class AccountingService {
  private adapters: Record<ProviderType, AccountingProviderAdapter>;

  constructor() {
    this.adapters = {
      quickbooks: new QuickBooksAdapter(),
      xero: new XeroAdapter(),
      sage: new SageAdapter(),
    };
  }

  getAdapter(provider: ProviderType): AccountingProviderAdapter {
    const adapter = this.adapters[provider];
    if (!adapter) {
      throw new Error(`Unsupported accounting provider: ${provider}`);
    }
    return adapter;
  }
}

export const accountingService = new AccountingService();
export default accountingService;
