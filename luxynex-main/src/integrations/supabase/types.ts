export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_banners: {
        Row: {
          created_at: string;
          id: string;
          image_url: string;
          is_active: boolean;
          link_url: string | null;
          sort_order: number;
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url: string;
          is_active?: boolean;
          link_url?: string | null;
          sort_order?: number;
          subtitle?: string | null;
          title?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string;
          is_active?: boolean;
          link_url?: string | null;
          sort_order?: number;
          subtitle?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "admin_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_customers: {
        Row: {
          address: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          phone: string;
          total_orders: number | null;
          total_spent: number | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          phone: string;
          total_orders?: number | null;
          total_spent?: number | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string;
          total_orders?: number | null;
          total_spent?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      support_tickets: {
        Row: {
          admin_reply: string | null;
          attachment_url: string | null;
          created_at: string;
          customer_email: string | null;
          customer_name: string;
          customer_phone: string | null;
          description: string;
          id: string;
          status: Database["public"]["Enums"]["ticket_status"];
          topic: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          admin_reply?: string | null;
          attachment_url?: string | null;
          created_at?: string;
          customer_email?: string | null;
          customer_name: string;
          customer_phone?: string | null;
          description: string;
          id?: string;
          status?: Database["public"]["Enums"]["ticket_status"];
          topic: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          admin_reply?: string | null;
          attachment_url?: string | null;
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string;
          customer_phone?: string | null;
          description?: string;
          id?: string;
          status?: Database["public"]["Enums"]["ticket_status"];
          topic?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      admin_orders: {
        Row: {
          created_at: string;
          customer_email: string | null;
          customer_name: string;
          customer_phone: string;
          discount: number;
          id: string;
          items: Json;
          notes: string | null;
          order_number: string;
          payment_details: Json | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_status: string | null;
          sender_number: string | null;
          transaction_id: string | null;
          shipping_address: string;
          shipping_fee: number;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          customer_email?: string | null;
          customer_name: string;
          customer_phone: string;
          discount?: number;
          id?: string;
          items?: Json;
          notes?: string | null;
          order_number: string;
          payment_details?: Json | null;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          payment_status?: string | null;
          sender_number?: string | null;
          transaction_id?: string | null;
          shipping_address: string;
          shipping_fee?: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string;
          customer_phone?: string;
          discount?: number;
          id?: string;
          items?: Json;
          notes?: string | null;
          order_number?: string;
          payment_details?: Json | null;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          payment_status?: string | null;
          sender_number?: string | null;
          transaction_id?: string | null;
          shipping_address?: string;
          shipping_fee?: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_popups: {
        Row: {
          button_link: string | null;
          button_text: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          title: string;
          updated_at: string;
        };
        Insert: {
          button_link?: string | null;
          button_text?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          title?: string;
          updated_at?: string;
        };
        Update: {
          button_link?: string | null;
          button_text?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_products: {
        Row: {
          attributes: Json | null;
          category: string;
          colors: string[] | null;
          created_at: string;
          delivery_time: string | null;
          description: string | null;
          discount_percent: number | null;
          id: string;
          images: string[] | null;
          is_active: boolean | null;
          is_free_delivery: boolean | null;
          max_order_qty: number | null;
          min_order_qty: number | null;
          name: string;
          offer_tags: string[] | null;
          order_type: string | null;
          original_price: number | null;
          pos_available: boolean | null;
          price: number;
          regular_price: number | null;
          return_policy: string | null;
          root_sku: string | null;
          sale_price: number | null;
          search_tags: string[] | null;
          sizes: string[] | null;
          sku: string | null;
          stock: number;
          subcategory_id: string | null;
          thumbnail: string | null;
          updated_at: string;
          variants: Json | null;
          warranty: string | null;
          website_available: boolean | null;
        };
        Insert: {
          attributes?: Json | null;
          category?: string;
          colors?: string[] | null;
          created_at?: string;
          delivery_time?: string | null;
          description?: string | null;
          discount_percent?: number | null;
          id?: string;
          images?: string[] | null;
          is_active?: boolean | null;
          is_free_delivery?: boolean | null;
          max_order_qty?: number | null;
          min_order_qty?: number | null;
          name: string;
          offer_tags?: string[] | null;
          order_type?: string | null;
          original_price?: number | null;
          pos_available?: boolean | null;
          price?: number;
          regular_price?: number | null;
          return_policy?: string | null;
          root_sku?: string | null;
          sale_price?: number | null;
          search_tags?: string[] | null;
          sizes?: string[] | null;
          sku?: string | null;
          stock?: number;
          subcategory_id?: string | null;
          thumbnail?: string | null;
          updated_at?: string;
          variants?: Json | null;
          warranty?: string | null;
          website_available?: boolean | null;
        };
        Update: {
          attributes?: Json | null;
          category?: string;
          colors?: string[] | null;
          created_at?: string;
          delivery_time?: string | null;
          description?: string | null;
          discount_percent?: number | null;
          id?: string;
          images?: string[] | null;
          is_active?: boolean | null;
          is_free_delivery?: boolean | null;
          max_order_qty?: number | null;
          min_order_qty?: number | null;
          name?: string;
          offer_tags?: string[] | null;
          order_type?: string | null;
          original_price?: number | null;
          pos_available?: boolean | null;
          price?: number;
          regular_price?: number | null;
          return_policy?: string | null;
          root_sku?: string | null;
          sale_price?: number | null;
          search_tags?: string[] | null;
          sizes?: string[] | null;
          sku?: string | null;
          stock?: number;
          subcategory_id?: string | null;
          thumbnail?: string | null;
          updated_at?: string;
          variants?: Json | null;
          warranty?: string | null;
          website_available?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_products_subcategory_id_fkey";
            columns: ["subcategory_id"];
            isOneToOne: false;
            referencedRelation: "admin_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_purchases: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          product_id: string;
          product_name: string;
          quantity: number;
          supplier: string | null;
          total_cost: number;
          unit_cost: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          product_id: string;
          product_name: string;
          quantity?: number;
          supplier?: string | null;
          total_cost?: number;
          unit_cost?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          supplier?: string | null;
          total_cost?: number;
          unit_cost?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          code: string;
          created_at: string;
          description: string;
          discount_amount: number;
          discount_percent: number;
          id: string;
          is_active: boolean;
          min_order_amount: number;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string;
          discount_amount?: number;
          discount_percent?: number;
          id?: string;
          is_active?: boolean;
          min_order_amount?: number;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string;
          discount_amount?: number;
          discount_percent?: number;
          id?: string;
          is_active?: boolean;
          min_order_amount?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          phone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string;
          id?: string;
          phone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          phone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_order_tracking: {
        Args: { p_order_number: string; p_phone: string };
        Returns: {
          created_at: string;
          customer_name: string;
          order_number: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_status: string;
          status: Database["public"]["Enums"]["order_status"];
          total: number;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      place_order: {
        Args: {
          p_customer_email: string;
          p_customer_name: string;
          p_customer_phone: string;
          p_items: Json;
          p_notes: string;
          p_payment_method: string;
          p_promo_discount_percent: number;
          p_shipping_address: string;
          p_shipping_fee: number;
        };
        Returns: {
          order_number: string;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled";
      payment_method: "cod" | "bkash" | "nagad" | "rocket";
      ticket_status: "open" | "in_progress" | "resolved";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_method: ["cod", "bkash", "nagad", "rocket"],
    },
  },
} as const;
