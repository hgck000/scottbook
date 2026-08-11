import type { PwaInstallMethod } from "./pwaStatus";

export type PwaInstallCopy = {
  title: string;
  instruction: string;
};

export function getInstallCopy(method: PwaInstallMethod): PwaInstallCopy {
  if (method === "native") {
    return {
      title: "Cài ScottBook trên thiết bị này",
      instruction:
        "Mở như một ứng dụng riêng, vẫn dùng thư viện và tiến độ khi ngoại tuyến."
    };
  }
  if (method === "ios") {
    return {
      title: "Cài ScottBook trên iPhone hoặc iPad",
      instruction:
        "Mở bằng Safari, bấm Chia sẻ, chọn “Thêm vào Màn hình chính” rồi xác nhận."
    };
  }
  if (method === "macos") {
    return {
      title: "Cài ScottBook trên MacBook",
      instruction:
        "Safari: Chia sẻ → Thêm vào Dock. Chrome hoặc Edge: dùng biểu tượng cài đặt trên thanh địa chỉ."
    };
  }
  return {
    title: "Cài ScottBook như một ứng dụng",
    instruction:
      "Mở menu trình duyệt và chọn “Cài đặt ứng dụng” hoặc “Thêm vào màn hình chính”."
  };
}
