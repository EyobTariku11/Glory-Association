import { Component, OnInit } from "@angular/core";
import { ConfigurationService } from "src/app/services/configuration.service";
import { UserService } from "src/app/services/user.service";
import { UserView } from "src/app/models/auth/userDto";
import { IGeneralCodeDto, IGeneralCodeUpsertDto } from "src/app/models/configuration/ICommonDto";
import { errorToast, successToast } from "src/app/services/toast.service";

type GeneralCodeTypeOption = { value: number; label: string };

@Component({
  selector: "app-general-codes",
  templateUrl: "./general-codes.component.html",
  styleUrls: ["./general-codes.component.scss"],
})
export class GeneralCodesComponent implements OnInit {
  user!: UserView;
  loading = false;

  codes: Array<
    IGeneralCodeDto & {
      generalCodeType: number;
      isNew?: boolean;
      saving?: boolean;
    }
  > = [];

  generalCodeTypes: GeneralCodeTypeOption[] = [
    { value: 0, label: "MEMBERPREFIX" },
    { value: 1, label: "TASKPREFIX" },
  ];

  constructor(
    private configurationService: ConfigurationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    this.loadCodes();
  }

  private generalCodeTypeFromString(code?: string): number {
    const map: Record<string, number> = {
      MEMBERPREFIX: 0,
      TASKPREFIX: 1,
    };
    return code ? map[code] ?? 0 : 0;
  }

  loadCodes(): void {
    if (!this.user?.loginId) {
      errorToast("Unable to load association info from token.");
      return;
    }

    this.loading = true;
    this.configurationService.getGeneralCodes(this.user.loginId).subscribe({
      next: (res) => {
        // Normalize response into editable rows
        this.codes = (res || []).map((c) => ({
          ...c,
          associationId: this.user.loginId,
          generalCodeType: this.generalCodeTypeFromString(c.generalCode),
          isNew: false,
          saving: false,
        }));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        errorToast("Failed to load general codes", err);
      },
    });
  }

  addRow(): void {
    if (!this.user?.loginId) return;

    this.codes.unshift({
      id: null as any,
      associationId: this.user.loginId,
      generalCode: "MEMBERPREFIX",
      generalCodeType: 0,
      initialName: "",
      pad: 8,
      currentNumber: 0,
      isNew: true,
      saving: false,
    });
  }

  removeRow(idx: number): void {
    this.codes.splice(idx, 1);
  }

  onTypeChange(row: any): void {
    const selected = this.generalCodeTypes.find((x) => x.value === row.generalCodeType);
    row.generalCode = selected?.label ?? "MEMBERPREFIX";
  }

  save(row: any): void {
    if (!this.user?.loginId) return;

    if (!row.initialName || row.initialName.trim().length === 0) {
      errorToast("InitialName is required");
      return;
    }
    if (!row.pad || row.pad <= 0) {
      errorToast("Pad must be a positive number");
      return;
    }
    if (row.currentNumber == null || row.currentNumber < 0) {
      errorToast("CurrentNumber must be >= 0");
      return;
    }

    const payload: IGeneralCodeUpsertDto = {
      id: row.id ?? null,
      associationId: this.user.loginId,
      generalCodeType: row.generalCodeType,
      initialName: row.initialName.trim(),
      pad: Number(row.pad),
      currentNumber: Number(row.currentNumber),
      createdById: this.user.userId,
    };

    row.saving = true;
    this.configurationService.upsertGeneralCode(payload).subscribe({
      next: (res) => {
        row.saving = false;
        if ((res as any)?.success === false) {
          errorToast((res as any)?.message || "Failed to save general code");
          return;
        }
        successToast("General code saved");
        this.loadCodes();
      },
      error: (err) => {
        row.saving = false;
        errorToast("Failed to save general code", err);
      },
    });
  }
}


