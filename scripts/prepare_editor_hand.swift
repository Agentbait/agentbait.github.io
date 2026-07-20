import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

guard CommandLine.arguments.count == 3 else {
  fputs("usage: prepare_editor_hand.swift input.png output.png\n", stderr)
  exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1]) as CFURL
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2]) as CFURL

guard
  let source = CGImageSourceCreateWithURL(inputURL, nil),
  let sourceImage = CGImageSourceCreateImageAtIndex(source, 0, nil)
else {
  fputs("could not read source image\n", stderr)
  exit(3)
}

let width = sourceImage.width
let height = sourceImage.height
let bytesPerRow = width * 4
var pixels = [UInt8](repeating: 0, count: height * bytesPerRow)

guard let context = CGContext(
  data: &pixels,
  width: width,
  height: height,
  bitsPerComponent: 8,
  bytesPerRow: bytesPerRow,
  space: CGColorSpaceCreateDeviceRGB(),
  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else {
  fputs("could not create image context\n", stderr)
  exit(4)
}

context.draw(sourceImage, in: CGRect(x: 0, y: 0, width: width, height: height))

var minX = width
var minY = height
var maxX = 0
var maxY = 0

for y in 0..<height {
  for x in 0..<width {
    let offset = y * bytesPerRow + x * 4
    let red = Int(pixels[offset])
    let green = Int(pixels[offset + 1])
    let blue = Int(pixels[offset + 2])
    let low = min(red, green, blue)
    let high = max(red, green, blue)
    let chroma = high - low

    var alpha = 255
    if low >= 238 && chroma <= 12 {
      alpha = 0
    } else if low >= 218 && chroma <= 14 {
      alpha = max(0, min(255, Int(Double(238 - low) / 20.0 * 255.0)))
    }

    if alpha < 255 {
      pixels[offset] = UInt8(red * alpha / 255)
      pixels[offset + 1] = UInt8(green * alpha / 255)
      pixels[offset + 2] = UInt8(blue * alpha / 255)
      pixels[offset + 3] = UInt8(alpha)
    }

    if alpha > 8 {
      minX = min(minX, x)
      minY = min(minY, y)
      maxX = max(maxX, x)
      maxY = max(maxY, y)
    }
  }
}

guard let transparentImage = context.makeImage() else {
  fputs("could not finalize transparent image\n", stderr)
  exit(5)
}

let padding = 8
let cropX = max(0, minX - padding)
let cropY = max(0, minY - padding)
let cropWidth = min(width - cropX, maxX - minX + 1 + padding * 2)
let cropHeight = min(height - cropY, maxY - minY + 1 + padding * 2)
let cropRect = CGRect(x: cropX, y: cropY, width: cropWidth, height: cropHeight)

guard
  let croppedImage = transparentImage.cropping(to: cropRect),
  let destination = CGImageDestinationCreateWithURL(outputURL, UTType.png.identifier as CFString, 1, nil)
else {
  fputs("could not create output image\n", stderr)
  exit(6)
}

CGImageDestinationAddImage(destination, croppedImage, nil)
guard CGImageDestinationFinalize(destination) else {
  fputs("could not write output image\n", stderr)
  exit(7)
}

print("wrote \(cropWidth)x\(cropHeight) transparent PNG")
