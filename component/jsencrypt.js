import JSEncrypt from 'jsencrypt'

// 密钥对生成 http://web.chacuo.net/netrsakeypair
const publicKey = "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI0N90Yirz3StSFyRe8zndAmYlfqI+JLsSCoGf9RV3hLLab9f0BTeKir+OJQoBNmojDxk7tZM6+zpXB+HulL5BcCAwEAAQ=="

const privateKey = "MIIBOgIBAAJBAI0N90Yirz3StSFyRe8zndAmYlfqI+JLsSCoGf9RV3hLLab9f0BTeKir+OJQoBNmojDxk7tZM6+zpXB+HulL5BcCAwEAAQJASxmNdxUOcn8WGympXHMB6goVwDMUSe787qMxvENFq/Cohhp2cUJpprGwwb93oX7mdlAWN3a11/6aLCD+w+QIAQIhAMJe/FCt3SJi0Y/3VgzKy3MCcqXGHLS1v82veUWPGoAXAiEAucdN1tlbpY14v1z5nIc03AS1jgigtpkiSlGaNAy0PAECIQCI9i2NHDZKWJ+adoqoEO4zaHIo5eSsYbV51j/6B9CAmQIgUAJ/CpXn+3/XTgs70WcFo/A/ROGAXcPL2dgVIm+KPAECICnX0D+B3EkplmmAMyttEgNZHE1/EMbBe6iLRR+vGLRy"

// 加密
export function encrypt(txt,keys) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(keys||publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt,keys) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(keys||privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}