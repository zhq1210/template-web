const API_BASE_URL = "/api";

// 通用请求方法
export async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      console.error(`API请求失败: ${url}, 状态码: ${response.status}`);
      // 根据状态码返回不同的默认值
      if (response.status === 500) {
        console.warn('服务器内部错误，可能是数据库连接问题');
      }
      return null; // 返回null而不是抛出错误
    }

    return response.json();
  } catch (error) {
    console.error(`网络请求失败: ${url}`, error);
    return null; // 网络错误也返回null
  }
}

// 带默认值的请求方法
export async function requestWithDefault<T>(
  url: string,
  defaultValue: T,
  options: RequestInit = {}
): Promise<T> {
  const result = await request<T>(url, options);
  return result ?? defaultValue;
}
