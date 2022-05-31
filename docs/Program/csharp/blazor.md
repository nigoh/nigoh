# Blazor

!!! info
    ASP.NET Core Blazor -  
    <https://docs.microsoft.com/ja-jp/aspnet/core/blazor/?view=aspnetcore-6.0>
    - Blazor C#でreact.jsのようなwebアプリケーションが作成できるフレームワーク

## 用語

- .NET プラットフォーム - 他種類のアプリケーションを構築するためにMicrosoftによって作成されたオープンソースの開発者プラットフォーム。
    - <https://dotnet.microsoft.com/ja-jp/learn/dotnet/what-is-dotnet>
-　ASP.NET - HTML、CSS、JavaScript を使用して優れた Web サイトと Web アプリケーションを構築するための無料の Web フレームワーク。
    - <https://dotnet.microsoft.com/ja-jp/apps/aspnet>

- Razor - HTMLとC#を使用して動的なWebページを作成するための構文
    - <https://docs.microsoft.com/ja-jp/aspnet/web-pages/overview/getting-started/>

        ```cshtml
        @if(IsPost) {
            // This line has all content between matched <p> tags.
            <p>Hello, the time is @DateTime.Now and this page is a postback!</p>
        } else {
            // All content between matched tags, followed by server code.
            <p>Hello <em>stranger</em>, today is: <br /> </p>  @DateTime.Now
        }
        ```

- 各用語のピラミッド構造 
    - ![img](img/20220601_064143.png)