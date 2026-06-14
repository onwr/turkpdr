type AdminTableLoadingRowProps = {
  colSpan: number;
  label?: string;
};

export function AdminTableLoadingRow({
  colSpan,
  label = "Yükleniyor...",
}: AdminTableLoadingRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-muted-foreground">
        {label}
      </td>
    </tr>
  );
}

type AdminTableEmptyRowProps = {
  colSpan: number;
  label?: string;
};

export function AdminTableEmptyRow({
  colSpan,
  label = "Kayıt bulunamadı.",
}: AdminTableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-muted-foreground">
        {label}
      </td>
    </tr>
  );
}
