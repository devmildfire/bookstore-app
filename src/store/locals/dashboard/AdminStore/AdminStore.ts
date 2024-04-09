import { computed, makeObservable, observable, runInAction } from 'mobx';
import { AdminClient } from '@/entities/admin';
import { adminAPI } from 'api/admin';
import { toast } from 'sonner';
import { LoadingStageModel } from '@/store/models/LoadingStageModel';

type LoginCredentials = {
  email: string;
  password: string;
};

class AdminStore {
  private _admin: AdminClient | null = null;
  state = new LoadingStageModel();

  constructor() {
    makeObservable<AdminStore, '_admin'>(this, {
      _admin: observable,
      isLoading: computed,
    });
  }

  get admin(): AdminClient | null {
    return this._admin;
  }

  get isLoading(): boolean {
    return this.state.loading;
  }

  login = async ({ email, password }: LoginCredentials): Promise<void> => {
    if (this.state.loading) {
      return;
    }

    this.state.setLoading();

    const { data, error } = await adminAPI.login({ email, password });

    runInAction(() => {
      if (error) {
        this.state.setLoadedWithError();

        toast.error('Не удалось войти', {
          description: 'Проверьте правильность введенных данных',
        });
      }

      if (data) {
        this._admin = data.user?.email ? { email: data.user?.email } : null;
        this.state.setLoadedSuccessfully();

        toast.success('Удалось войти!', {
          description: 'вы всё сделали правильно',
        });
      }
    });
  };

  destroy(): void {
    return;
  }
}

export default AdminStore;
