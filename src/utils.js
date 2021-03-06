export function getDate() {
    const date = new Date();
    // Results below assume UTC timezone - your results may vary
  
    // Specify default date formatting for language (locale)
    const normal = new Intl.DateTimeFormat("es-DO").format(date).trim();
  
    return {
      toFirebase(convert = false) {
        if (convert) {
          return convert.replaceAll("/", "-");
        }
  
        return normal.replaceAll("/", "-");
      },
      toString(convert = false) {
        if (convert) {
          return convert.replaceAll("-", "/");
        }
  
        return normal;
      },
    };
  }
  
  export const menuStockImage =
    "https://media.istockphoto.com/vectors/restaurant-menu-continuous-thin-line-illustration-vector-id1141437146?b=1&k=20&m=1141437146&s=612x612&w=0&h=tYYuqqiVli9iIi7fFMJi_n3nJY3BrHCE-dMMTOirZEM=";
  
  export const userStockImage =
    "https://www.clipartkey.com/mpngs/m/62-620518_clipart-abstract-user-icon-small-user-icon-png.png";
  
  export function Admin() {
    return (
      window.localStorage.getItem("USER_UID") === "7O10Qx4YtzcWQ9b5Zm2SRbHnYf72"
    );
  }
  
  function bytesToUuid(bytes) {
    const bits = [...bytes].map((bit) => {
      const s = bit.toString(16);
      return bit < 0x10 ? "0" + s : s;
    });
    return [
      ...bits.slice(0, 4),
      "-",
      ...bits.slice(4, 6),
      "-",
      ...bits.slice(6, 8),
      "-",
      ...bits.slice(8, 10),
      "-",
      ...bits.slice(10, 16),
    ].join("");
  }
  
  const UUID_RE = new RegExp(
    "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    "i"
  );
  
  export function validate(id) {
    return UUID_RE.test(id);
  }
  
  /** Generates a RFC4122 v4 UUID (pseudo-randomly-based) */
  export function generate() {
    const rnds = crypto.getRandomValues(new Uint8Array(16));
  
    rnds[6] = (rnds[6] & 0x0f) | 0x40; // Version 4
    rnds[8] = (rnds[8] & 0x3f) | 0x80; // Variant 10
  
    return bytesToUuid(rnds);
  }
  
  export default {
    validate,
    generate,
  };