cmake_minimum_required(VERSION 3.14)
project(runner LANGUAGES CXX)

add_executable(${BINARY_NAME}
  "flutter_window.cpp"
  "main.cpp"
  "my_window.cpp"
  "resource.h"
  "runner.exe.manifest"
  "${FLUTTER_MANIFEST_DIR}"
  "${FLUTTER_ICU_DATA_FILE}"
  "${FLUTTER_LIBRARY}"
  "${CMAKE_CURRENT_BINARY_DIR}/generated_plugin_registrant.cc"
)

add_subdirectory("${FLUTTER_DIR}" "${CMAKE_CURRENT_BINARY_DIR}/flutter")
target_link_libraries(${BINARY_NAME} PRIVATE flutter flutter_wrapper_app)
target_include_directories(${BINARY_NAME} PRIVATE
  "${CMAKE_SOURCE_DIR}"
)
